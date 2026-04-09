import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trophy, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      padding: '1rem 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          color: 'white',
          fontWeight: 800,
          fontSize: '1.5rem',
          letterSpacing: '-1px'
        }}>
          <Trophy size={32} color="#D32F2F" fill="#D32F2F" />
          DBX <span style={{ color: '#D32F2F' }}>FOOTBALL</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user ? (
            <>
              <Link to="/profile" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end', 
                textDecoration: 'none', 
                color: 'white' 
              }}>
                <span style={{ fontSize: '0.75rem', color: '#D32F2F', fontWeight: 700, letterSpacing: '1px' }}>
                  {isAdmin ? 'ADMIN' : 'PLAYER'}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.email}</span>
              </Link>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link 
                  to="/profile" 
                  className="premium-btn"
                  style={{ padding: '0.5rem', background: 'transparent', boxShadow: 'none', border: '1px solid #333' }}
                  title="Settings"
                >
                  <Settings size={18} />
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="premium-btn"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
              <Link to="/register" className="premium-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
