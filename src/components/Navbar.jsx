import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AuthContext';
import { Trophy, Lock, Unlock } from 'lucide-react';

const Navbar = () => {
  const { isAdmin, lockAdmin } = useAdmin();

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
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

          <div style={{ display: 'flex', gap: '1.5rem', marginLeft: '1rem' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, opacity: 0.8 }}
                  onMouseOver={e => e.currentTarget.style.opacity = 1}
                  onMouseOut={e => e.currentTarget.style.opacity = 0.8}>
              Academy
            </Link>
            <Link to="/leagues" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, opacity: 0.8 }}
                  onMouseOver={e => e.currentTarget.style.opacity = 1}
                  onMouseOut={e => e.currentTarget.style.opacity = 0.8}>
              Leagues
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#4CAF50', 
                fontWeight: 700, 
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Unlock size={14} />
                ADMIN MODE
              </span>
              <button 
                onClick={lockAdmin}
                className="premium-btn"
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.8rem',
                  background: 'transparent',
                  border: '1px solid #333',
                  boxShadow: 'none'
                }}
              >
                <Lock size={14} />
                Lock
              </button>
            </div>
          ) : (
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#888', 
              fontWeight: 600, 
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Lock size={14} />
              VIEW ONLY
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
