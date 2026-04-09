import React from 'react';
import { User, Ruler, Weight, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentCard = ({ student }) => {
  const name = student.name || 'Unknown';
  const position = student.position || 'N/A';
  const age = student.age || 'N/A';
  const height = student.height || 'N/A';
  const weight = student.weight || 'N/A';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="premium-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div style={{
        height: '220px',
        width: 'calc(100% + 3rem)',
        margin: '-1.5rem -1.5rem 0 -1.5rem',
        background: student.picture_url 
          ? `url(${student.picture_url}) center/cover no-repeat` 
          : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!student.picture_url && (
          <span style={{ 
            fontSize: '4rem', 
            fontWeight: 800, 
            color: 'rgba(211, 47, 47, 0.15)',
            userSelect: 'none'
          }}>
            {name[0].toUpperCase()}
          </span>
        )}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(26,26,26,1), transparent)'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1.5rem',
          right: '1.5rem'
        }}>
          <span style={{ 
            background: '#D32F2F', 
            color: 'white', 
            padding: '3px 10px', 
            borderRadius: '4px', 
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {position}
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>{name}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#888' }}>
          <User size={16} />
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age</div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{age} {age !== 'N/A' ? 'yrs' : ''}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#888' }}>
          <Award size={16} />
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position</div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{position}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#888' }}>
          <Ruler size={16} />
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Height</div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{height} {height !== 'N/A' ? 'cm' : ''}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#888' }}>
          <Weight size={16} />
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weight</div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{weight} {weight !== 'N/A' ? 'kg' : ''}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentCard;
