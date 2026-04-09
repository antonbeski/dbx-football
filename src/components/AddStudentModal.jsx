import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
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
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('students')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error('Could not upload image. Make sure a public bucket named "students" exists in Supabase Storage.');
        }

        const { data: urlData } = supabase.storage
          .from('students')
          .getPublicUrl(fileName);
        
        picture_url = urlData.publicUrl;
      }

      const insertData = {
        name: formData.name,
        position: formData.position,
        picture_url: picture_url || null,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height || null,
        weight: formData.weight || null
      };

      const { error: insertError } = await supabase
        .from('students')
        .insert([insertData]);

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  };

  // Close modal on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
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
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="premium-card glass"
        style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Add New <span style={{ color: '#D32F2F' }}>Student</span></h2>
          <button onClick={onClose} style={{ background: 'transparent', color: '#888', padding: '0.5rem', borderRadius: '8px' }}
            onMouseOver={e => e.currentTarget.style.color = 'white'}
            onMouseOut={e => e.currentTarget.style.color = '#888'}
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 82, 82, 0.1)',
            border: '1px solid #FF5252',
            color: '#FF5252',
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Full Name *</label>
              <input 
                id="student-name"
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter student name" 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Age *</label>
              <input 
                id="student-age"
                type="number" 
                required 
                min="5"
                max="50"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                placeholder="18" 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Position *</label>
              <select 
                id="student-position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              >
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Height (cm)</label>
              <input 
                id="student-height"
                type="number" 
                min="50"
                max="250"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                placeholder="185" 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Weight (kg)</label>
              <input 
                id="student-weight"
                type="number" 
                min="20"
                max="200"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="80" 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Profile Picture</label>
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
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                {file ? (
                  <div style={{ color: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Check size={24} /> {file.name}
                  </div>
                ) : (
                  <>
                    <Upload size={32} color="#555" style={{ marginBottom: '0.75rem' }} />
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Click to upload student photo</p>
                    <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.25rem' }}>PNG, JPG up to 5MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="premium-btn" 
              style={{ flex: 1, background: 'transparent', border: '1px solid #333', boxShadow: 'none' }}
            >
              Cancel
            </button>
            <button 
              id="save-student"
              type="submit" 
              className="premium-btn" 
              style={{ flex: 2, justifyContent: 'center' }} 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddStudentModal;
