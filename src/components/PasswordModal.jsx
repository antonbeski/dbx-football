import React, { useState } from 'react';
import { Lock, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AuthContext';

const PasswordModal = () => {
  const { showPasswordModal, setShowPasswordModal, verifyPassword } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const success = verifyPassword(password);
    if (!success) {
      setError('Incorrect password');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
    setPassword('');
  };

  const handleClose = () => {
    setShowPasswordModal(false);
    setPassword('');
    setError('');
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <AnimatePresence>
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdrop}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              x: shaking ? [0, -10, 10, -10, 10, 0] : 0
            }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="premium-card glass"
            style={{ width: '100%', maxWidth: '400px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(211, 47, 47, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lock size={24} color="#D32F2F" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Admin Access</h3>
                  <p style={{ color: '#666', fontSize: '0.8rem' }}>Enter password to edit</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'transparent', color: '#666', padding: '0.5rem', borderRadius: '8px' }}
                onMouseOver={e => e.currentTarget.style.color = 'white'}
                onMouseOut={e => e.currentTarget.style.color = '#666'}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 82, 82, 0.1)',
                border: '1px solid #FF5252',
                color: '#FF5252',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#555" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="admin-password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  style={{ paddingLeft: '3rem' }}
                />
              </div>

              <button
                id="admin-submit"
                type="submit"
                className="premium-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Lock size={18} />
                Unlock
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordModal;
