import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAdmin } from '../context/AuthContext';
import { ChevronLeft, Loader2, Users, Calendar, Trophy, BarChart2 } from 'lucide-react';
import DraftTab from '../components/league/DraftTab';
import FixturesTab from '../components/league/FixturesTab';
import StandingsTab from '../components/league/StandingsTab';

const LeagueDashboard = () => {
  const { id } = useParams();
  const { isAdmin, requestAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState('draft');
  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeagueData = async () => {
    setLoading(true);
    try {
      const [lg, tm, pl, fx, st] = await Promise.all([
        supabase.from('leagues').select('*').eq('id', id).single(),
        supabase.from('teams').select('*').eq('league_id', id).order('name'),
        supabase.from('league_players').select('*').eq('league_id', id),
        supabase.from('fixtures').select('*').eq('league_id', id).order('matchday_number').order('id'),
        supabase.from('standings').select('*').eq('league_id', id)
      ]);

      if (lg.data) setLeague(lg.data);
      if (tm.data) setTeams(tm.data);
      if (pl.data) setPlayers(pl.data);
      if (fx.data) setFixtures(fx.data);
      if (st.data) setStandings(st.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeagueData();
  }, [id]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="spinner-icon" size={48} /></div>;
  }

  if (!league) {
    return <div className="dashboard-container"><h2>League not found</h2></div>;
  }

  return (
    <div className="dashboard-container">
      <Link to="/leagues" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ChevronLeft size={20} /> Back to Leagues
      </Link>

      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>
              {league.name}
            </h1>
            <p style={{ color: '#888', fontSize: '1.1rem' }}>Season {league.season} • {league.total_teams} Teams</p>
          </div>
          <div style={{ padding: '0.4rem 1rem', borderRadius: '20px', background: 'rgba(255,193,7,0.1)', color: '#FFC107', fontWeight: 700, border: '1px solid currentColor' }}>
            {league.status.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <button className="premium-btn" style={{ background: activeTab === 'draft' ? '#D32F2F' : 'transparent', border: 'none', boxShadow: 'none' }} onClick={() => setActiveTab('draft')}><Users size={18}/> Draft & Players</button>
        <button className="premium-btn" style={{ background: activeTab === 'fixtures' ? '#D32F2F' : 'transparent', border: 'none', boxShadow: 'none' }} onClick={() => setActiveTab('fixtures')}><Calendar size={18}/> Fixtures & Results</button>
        <button className="premium-btn" style={{ background: activeTab === 'standings' ? '#D32F2F' : 'transparent', border: 'none', boxShadow: 'none' }} onClick={() => setActiveTab('standings')}><Trophy size={18}/> Standings</button>
      </div>

      <div>
        {activeTab === 'draft' && <DraftTab league={league} teams={teams} players={players} refreshData={fetchLeagueData} />}
        {activeTab === 'fixtures' && <FixturesTab league={league} teams={teams} fixtures={fixtures} refreshData={fetchLeagueData} />}
        {activeTab === 'standings' && <StandingsTab league={league} teams={teams} standings={standings} fixtures={fixtures} />}
      </div>
    </div>
  );
};

export default LeagueDashboard;
