import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Trophy, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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
          FOOT<span style={{ color: '#D32F2F' }}>BALL</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {user ? (
            <>
              <Link to="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textDecoration: 'none', color: 'white' }}>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                  {isAdmin ? 'ADMIN ACCESS' : 'PLAYER ACCESS'}
                </span>
                <span style={{ fontWeight: 600 }}>{user.email}</span>
              </Link>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link 
                  to="/profile" 
                  className="premium-btn glass"
                  style={{ padding: '0.5rem', background: 'transparent' }}
                  title="Settings"
                >
                  <Settings size={18} />
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="premium-btn"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
              <Link to="/register" style={{ color: '#D32F2F', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
