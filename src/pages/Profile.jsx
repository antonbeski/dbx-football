import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Account <span style={{ color: '#D32F2F' }}>Settings</span></h1>
        <p style={{ color: '#888' }}>Manage your security and preferences</p>
      </header>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card glass"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'var(--primary)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Shield size={32} color="white" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700 }}>Security Center</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Logged in as {user?.email}</p>
          </div>
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

        {success && (
          <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid #4CAF50',
            color: '#4CAF50',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem'
          }}>
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Change Password</h4>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#555" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                id="new-password"
                type="password" 
                placeholder="Min. 6 characters" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
                minLength={6}
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#555" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                id="confirm-new-password"
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                minLength={6}
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <button 
            id="update-password-submit"
            type="submit" 
            className="premium-btn" 
            disabled={loading} 
            style={{ width: 'fit-content' }}
          >
            {loading ? 'Updating...' : <><Shield size={20} /> Update Password</>}
          </button>
        </form>
      </motion.section>
    </div>
  );
};

export default Profile;
