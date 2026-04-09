import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AddStudentModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    position: 'Forward',
    height: '',
    weight: '',
    picture_url: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let picture_url = formData.picture_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Attempt to upload - note: user must have created 'students' bucket and set public access
        const { error: uploadError, data } = await supabase.storage
          .from('students')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error('Could not upload image. Make sure a public bucket named "students" exists in Supabase.');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('students')
          .getPublicUrl(filePath);
        
        picture_url = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('students')
        .insert([{ ...formData, picture_url, age: parseInt(formData.age) }]);

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="premium-card glass"
        style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Add New <span style={{ color: '#D32F2F' }}>Student</span></h2>
          <button onClick={onClose} style={{ background: 'transparent', color: '#888' }}><X size={24} /></button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 82, 82, 0.1)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
              <input 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Cristiano Ronaldo" 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Age</label>
              <input 
                type="number" 
                required 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                placeholder="18" 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Position</label>
              <select 
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              >
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Height (cm)</label>
              <input 
                type="number" 
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                placeholder="185" 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Weight (kg)</label>
              <input 
                type="number" 
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="80" 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Profile Picture</label>
            <div style={{ 
              border: '2px dashed #333', 
              borderRadius: '12px', 
              padding: '2rem', 
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} onMouseOver={e => e.currentTarget.style.borderColor = '#D32F2F'} onMouseOut={e => e.currentTarget.style.borderColor = '#333'}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                id="file-upload" 
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                {file ? (
                  <div style={{ color: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Check size={24} /> {file.name}
                  </div>
                ) : (
                  <>
                    <Upload size={32} color="#555" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#888' }}>Click to upload student photo</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="premium-btn glass" style={{ flex: 1, background: 'transparent' }}>
              Cancel
            </button>
            <button type="submit" className="premium-btn" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Save Student'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddStudentModal;
