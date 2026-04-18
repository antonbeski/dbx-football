import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAdmin } from '../context/AuthContext';
import { Trophy, Plus, MapPin, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateLeagueModal from '../components/CreateLeagueModal';
import { motion, AnimatePresence } from 'framer-motion';

const LeagueList = () => {
  const { requestAdmin } = useAdmin();
  const navigate = useNavigate();
  const [leagues, setLeagues] = [useState([]), useState([])][0];
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLeague, setEditLeague] = useState(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setLeagues(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    requestAdmin(() => {
      setEditLeague(null);
      setShowModal(true);
    });
  };

  const handleEditLeague = (e, league) => {
    e.stopPropagation();
    requestAdmin(() => {
      setEditLeague(league);
      setShowModal(true);
    });
  };

  const handleDeleteLeague = (e, league) => {
    e.stopPropagation();
    requestAdmin(async () => {
      if (!window.confirm(`Are you sure you want to delete ${league.name}? This will delete all teams, fixtures, and standings. This cannot be undone.`)) return;
      
      try {
        const { error } = await supabase.from('leagues').delete().eq('id', league.id);
        if (error) throw error;
        fetchLeagues();
      } catch (err) {
        console.error('Failed to delete league:', err);
        alert('Failed to delete league.');
      }
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'setup': return '#FFC107'; // Yellow
      case 'active': return '#4CAF50'; // Green
      case 'completed': return '#888888'; // Grey
      default: return '#333';
    }
  };

  return (
    <div className="dashboard-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
            League <span style={{ color: '#D32F2F' }}>Management</span>
          </h1>
          <p style={{ color: '#888' }}>Create and manage seasonal tournaments</p>
        </div>
        <button className="premium-btn" onClick={handleCreate}>
          <Plus size={20} />
          Create League
        </button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div className="spinner" />
        </div>
      ) : leagues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#555' }}>
          <Trophy size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
          <p>No leagues created yet. Click "Create League" to start a new season!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {leagues.map(league => (
            <motion.div 
              key={league.id}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/leagues/${league.id}`)}
              className="premium-card glass"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.2rem' }}>{league.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#888', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    Season {league.season}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.6rem', 
                    borderRadius: '12px', background: `${getStatusColor(league.status)}22`,
                    color: getStatusColor(league.status), border: `1px solid ${getStatusColor(league.status)}44`,
                    textTransform: 'uppercase'
                  }}>
                    {league.status}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                      onClick={(e) => handleEditLeague(e, league)}
                      style={{ background: 'transparent', border: 'none', color: '#888', padding: '0.2rem', cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#888'}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteLeague(e, league)}
                      style={{ background: 'transparent', border: 'none', color: '#D32F2F', padding: '0.2rem', cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#FF5252'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#D32F2F'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#999' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={16} color="#D32F2F" /> {league.total_teams} Teams
                </div>
                {league.match_duration_minutes && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} color="#D32F2F" /> {league.match_duration_minutes}m
                  </div>
                )}
                {league.ground_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={16} color="#D32F2F" /> {league.ground_name}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateLeagueModal 
          initialData={editLeague}
          onClose={() => {
            setShowModal(false);
            setEditLeague(null);
          }}
          onSuccess={(newLeagueId) => {
            setShowModal(false);
            setEditLeague(null);
            if (!editLeague) {
              navigate(`/leagues/${newLeagueId}`);
            } else {
              fetchLeagues();
            }
          }}
        />
      )}
    </div>
  );
};

export default LeagueList;
