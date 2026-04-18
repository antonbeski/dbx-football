import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAdmin } from '../../context/AuthContext';
import { generateSnakeDraft } from '../../lib/leagueLogic';
import { Plus, Users, AlertCircle, Trash2, Edit } from 'lucide-react';

const DraftTab = ({ league, teams, players, refreshData }) => {
  const { requestAdmin } = useAdmin();
  const [formData, setFormData] = useState({ name: '', age: '', position: 'forward', skill_level: '3' });
  const [loading, setLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (league.status !== 'setup') return;

    setLoading(true);
    try {
      const { error } = await supabase.from('league_players').insert([{
        league_id: league.id,
        name: formData.name,
        age: parseInt(formData.age) || null,
        position: formData.position,
        skill_level: parseInt(formData.skill_level)
      }]);
      if (!error) {
        setFormData({ name: '', age: '', position: 'forward', skill_level: '3' });
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeletePlayer = (playerId) => {
    requestAdmin(async () => {
      if (!window.confirm("Are you sure you want to delete this player?")) return;
      try {
        await supabase.from('league_players').delete().eq('id', playerId);
        refreshData();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleEditTeamName = (team) => {
    requestAdmin(async () => {
      const newName = window.prompt("Enter new team name:", team.name);
      if (newName && newName.trim() !== "" && newName !== team.name) {
        try {
          await supabase.from('teams').update({ name: newName.trim() }).eq('id', team.id);
          refreshData();
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleExecuteDraft = () => {
    requestAdmin(async () => {
      setDrafting(true);
      try {
        const allocations = generateSnakeDraft(players, teams);
        
        // Mass update loop since Supabase REST doesn't have bulk upsert easily grouped by different IDs without knowing the shape
        for (const alloc of allocations) {
          await supabase.from('league_players')
            .update({ team_id: alloc.team_id })
            .eq('id', alloc.player_id);
        }

        // Initialize standings table for these teams
        const standingInserts = teams.map(t => ({ league_id: league.id, team_id: t.id }));
        await supabase.from('standings').insert(standingInserts).select();

        // Optional: Update league status to active? Wait, Fixtures need to be generated next.
        refreshData();
      } catch (err) {
        console.error("Draft error", err);
      }
      setDrafting(false);
    });
  };

  const hasDrafted = players.some(p => p.team_id);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
      
      {/* Player Registration Column */}
      <div className="premium-card glass" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Register Player</h3>
        {league.status === 'setup' && !hasDrafted ? (
          <form onSubmit={handleAddPlayer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Name</label>
              <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Player Name" style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Age</label>
                <input type="number" required value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Skill (1-5)</label>
                <input type="number" min="1" max="5" required value={formData.skill_level} onChange={e=>setFormData({...formData, skill_level: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Position</label>
              <select value={formData.position} onChange={e=>setFormData({...formData, position: e.target.value})} style={{ width: '100%', padding: '0.5rem' }}>
                <option value="goalkeeper">Goalkeeper</option>
                <option value="defender">Defender</option>
                <option value="midfielder">Midfielder</option>
                <option value="forward">Forward</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="premium-btn" style={{ justifyContent: 'center' }}>
              <Plus size={16}/> Add to Pool
            </button>
          </form>
        ) : (
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', color: '#888' }}>
            Registration is closed because teams have already been drafted.
          </div>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #333' }}>
          <h4 style={{ marginBottom: '1rem' }}>Draft Actions</h4>
          {!hasDrafted ? (
            <button onClick={handleExecuteDraft} disabled={drafting || players.length === 0} className="premium-btn" style={{ width: '100%', justifyContent: 'center', background: '#D32F2F', borderColor: '#D32F2F' }}>
              <Users size={16}/> {drafting ? 'Drafting...' : 'Execute Snake Draft'}
            </button>
          ) : (
            <div style={{ color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={16} /> Teams have been drafted
            </div>
          )}
        </div>
      </div>

      {/* Roster Display Column */}
      <div className="premium-card glass">
        <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Player Pool ({players.length})</h3>
        
        {!hasDrafted ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {players.map(p => (
              <div key={p.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid #222', position: 'relative' }}>
                <button 
                  onClick={() => handleDeletePlayer(p.id)}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: '#D32F2F', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem', paddingRight: '1.5rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ textTransform: 'capitalize' }}>{p.position}</span>
                  <span style={{ color: '#FFC107' }}>★ {p.skill_level}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {teams.map(team => {
              const teamPlayers = players.filter(p => p.team_id === team.id);
              return (
                <div key={team.id} style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: '#222', padding: '0.75rem 1rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {team.name} <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 400 }}>({teamPlayers.length} players)</span>
                    </div>
                    <button onClick={() => handleEditTeamName(team)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                      <Edit size={14} />
                    </button>
                  </div>
                  <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                    {teamPlayers.map(p => (
                      <div key={p.id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{p.name} <span style={{ opacity: 0.5 }}>({p.position.substring(0,3).toUpperCase()})</span></span>
                        <span style={{ color: '#FFC107' }}>★ {p.skill_level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default DraftTab;
