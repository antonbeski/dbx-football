import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateLeagueModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    season: new Date().getFullYear().toString(),
    total_teams: 4,
    match_duration_minutes: 30,
    ground_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create League
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .insert([{
          name: formData.name,
          season: formData.season,
          total_teams: parseInt(formData.total_teams),
          match_duration_minutes: parseInt(formData.match_duration_minutes),
          ground_name: formData.ground_name,
          status: 'setup'
        }])
        .select()
        .single();

      if (leagueError) throw leagueError;

      // 2. Auto-generate empty generic teams for the draft
      const teamInserts = [];
      for (let i = 1; i <= parseInt(formData.total_teams); i++) {
        teamInserts.push({
          league_id: leagueData.id,
          name: `Team ${i}`,
          total_players: 0
        });
      }

      const { error: teamsError } = await supabase.from('teams').insert(teamInserts);
      if (teamsError) throw teamsError;

      onSuccess(leagueData.id);
    } catch (err) {
      setError(err.message || 'Failed to create league.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 2000, padding: '1rem'
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="premium-card glass"
        style={{ width: '100%', maxWidth: '500px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy color="#D32F2F" /> Create <span style={{ color: '#D32F2F' }}>League</span>
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', color: '#888' }}><X /></button>
        </div>

        {error && <div style={{ color: '#FF5252', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,82,82,0.1)', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>League Name *</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Summer Cup" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Season</label>
              <input required value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Total Teams *</label>
              <select value={formData.total_teams} onChange={e => setFormData({...formData, total_teams: e.target.value})}>
                <option value="4">4 Teams</option>
                <option value="5">5 Teams</option>
                <option value="6">6 Teams</option>
                <option value="8">8 Teams</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Match Duration (mins)</label>
              <input type="number" required value={formData.match_duration_minutes} onChange={e => setFormData({...formData, match_duration_minutes: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ground Name</label>
              <input value={formData.ground_name} onChange={e => setFormData({...formData, ground_name: e.target.value})} placeholder="School Pitch 1" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="premium-btn" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            {loading ? 'Creating...' : 'Create League'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateLeagueModal;
