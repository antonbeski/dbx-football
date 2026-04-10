import React, { useMemo } from 'react';
import { recalculateStandings } from '../../lib/leagueLogic';
import { Trophy } from 'lucide-react';

const StandingsTab = ({ league, teams, fixtures }) => {

  const standings = useMemo(() => {
    if (teams.length === 0) return [];
    return recalculateStandings(teams, fixtures);
  }, [teams, fixtures]);

  if (standings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#555' }}>
        <Trophy size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
        <p>No standings available. Teams need to be drafted first.</p>
      </div>
    );
  }

  return (
    <div className="premium-card glass" style={{ overflowX: 'auto' }}>
      <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>League Table</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', color: '#888', fontSize: '0.85rem' }}>
            <th style={{ padding: '1rem 0.5rem', textAlign: 'left', width: '40px' }}>Pos</th>
            <th style={{ padding: '1rem 0.5rem', textAlign: 'left' }}>Club</th>
            <th style={{ padding: '1rem 0.5rem', width: '40px' }}>P</th>
            <th style={{ padding: '1rem 0.5rem', width: '40px' }}>W</th>
            <th style={{ padding: '1rem 0.5rem', width: '40px' }}>D</th>
            <th style={{ padding: '1rem 0.5rem', width: '40px' }}>L</th>
            <th style={{ padding: '1rem 0.5rem', width: '40px' }}>GF</th>
            <th style={{ padding: '1rem 0.5rem', width: '40px' }}>GA</th>
            <th style={{ padding: '1rem 0.5rem', width: '40px' }}>GD</th>
            <th style={{ padding: '1rem 0.5rem', width: '50px', fontWeight: 800, color: '#fff' }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, index) => {
            const isChampion = index === 0;
            const isBottom = index === standings.length - 1;

            return (
              <tr key={row.team_id} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: isChampion ? 'rgba(255, 193, 7, 0.05)' : (isBottom ? 'rgba(211, 47, 47, 0.05)' : 'transparent')
              }}>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'left', fontWeight: 800, color: isChampion ? '#FFC107' : (isBottom ? '#D32F2F' : '#888') }}>
                  {index + 1}
                </td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{row.name}</td>
                <td style={{ padding: '1rem 0.5rem' }}>{row.played}</td>
                <td style={{ padding: '1rem 0.5rem', color: '#4CAF50' }}>{row.won}</td>
                <td style={{ padding: '1rem 0.5rem', color: '#888' }}>{row.drawn}</td>
                <td style={{ padding: '1rem 0.5rem', color: '#FF5252' }}>{row.lost}</td>
                <td style={{ padding: '1rem 0.5rem' }}>{row.goals_for}</td>
                <td style={{ padding: '1rem 0.5rem' }}>{row.goals_against}</td>
                <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: row.goal_difference > 0 ? '#4CAF50' : (row.goal_difference < 0 ? '#FF5252' : '#888') }}>
                  {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                </td>
                <td style={{ padding: '1rem 0.5rem', fontWeight: 800, fontSize: '1.1rem' }}>{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTab;
