// leagueLogic.js

/**
 * Executes a snake draft to distribute players evenly across teams.
 * To ensure positional balance, it snake drafts each position group independently.
 *
 * @param {Array} players - Array of player objects { id, skill_level, position, ... }
 * @param {Array} teams - Array of team objects { id, name, ... }
 * @returns {Array} - Array of { player_id, team_id } allocations
 */
export const generateSnakeDraft = (players, teams) => {
  const allocations = [];
  const positions = ['goalkeeper', 'defender', 'midfielder', 'forward'];

  let globalPickIndex = 0; // Tracks direction across the entire draft for smoothness

  positions.forEach(pos => {
    // Filter and sort by skill descending
    const posPlayers = players
      .filter(p => p.position === pos)
      .sort((a, b) => b.skill_level - a.skill_level);

    posPlayers.forEach((player) => {
      // Determine direction (0 to N-1 or N-1 to 0) based on round
      const round = Math.floor(globalPickIndex / teams.length);
      const positionInRound = globalPickIndex % teams.length;

      let teamIndex;
      if (round % 2 === 0) {
        // Left to right
        teamIndex = positionInRound;
      } else {
        // Right to left
        teamIndex = teams.length - 1 - positionInRound;
      }

      allocations.push({
        player_id: player.id,
        team_id: teams[teamIndex].id
      });

      globalPickIndex++;
    });
  });

  return allocations;
};

/**
 * Generates a double round-robin fixture set (Home and Away)
 *
 * @param {Array} teams - Array of team objects { id, name, ... }
 * @returns {Array} - Array of fixture objects { home_team_id, away_team_id, matchday_number }
 */
export const generateFixtures = (teams) => {
  if (teams.length % 2 !== 0 && teams.length > 0) {
    // We shouldn't technically get odd numbers based on spec constraint of 4,6,8 but just in case:
    teams = [...teams, { id: 'BYE' }];
  }

  const n = teams.length;
  const numRounds = n - 1;
  const matchdays = [];

  // Used for rotation
  const teamIds = teams.map(t => t.id);

  // Generate First Half of season
  for (let round = 0; round < numRounds; round++) {
    const matchday = [];
    for (let i = 0; i < n / 2; i++) {
      const home = teamIds[i];
      const away = teamIds[n - 1 - i];

      if (home !== 'BYE' && away !== 'BYE') {
        // Alternate home/away for the fixed team[0]
        if (i === 0 && round % 2 !== 0) {
          matchday.push({ home_team_id: away, away_team_id: home, matchday_number: round + 1 });
        } else {
          matchday.push({ home_team_id: home, away_team_id: away, matchday_number: round + 1 });
        }
      }
    }
    matchdays.push(matchday);
    // Rotate array: keep first item, rotate rest clockwise
    teamIds.splice(1, 0, teamIds.pop());
  }

  // Generate Second Half of season (flipped Home/Away)
  const secondHalf = matchdays.map((day, ix) => 
    day.map(fixture => ({
      home_team_id: fixture.away_team_id,
      away_team_id: fixture.home_team_id,
      matchday_number: numRounds + ix + 1
    }))
  );

  // Flatten and return
  return [...matchdays.flat(), ...secondHalf.flat()];
};

/**
 * Recalculate standings, sorting by points, GD, GF, and then Head-to-Head metrics if tied.
 *
 * @param {Array} teams 
 * @param {Array} fixtures - Completed fixtures containing home_goals and away_goals
 * @returns {Array} - Sorted array of formatted standing rows.
 */
export const recalculateStandings = (teams, fixtures) => {
  // Initialize map
  const statsMap = {};
  teams.forEach(t => {
    statsMap[t.id] = {
      team_id: t.id,
      name: t.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0
    };
  });

  const completedFixtures = fixtures.filter(f => f.status === 'completed');

  // Accumulate raw stats
  completedFixtures.forEach(f => {
    if (!statsMap[f.home_team_id] || !statsMap[f.away_team_id]) return; // Skip if invalid teams
    
    const h = statsMap[f.home_team_id];
    const a = statsMap[f.away_team_id];
    const hG = f.home_goals || 0;
    const aG = f.away_goals || 0;

    h.played++;
    a.played++;
    h.goals_for += hG;
    h.goals_against += aG;
    a.goals_for += aG;
    a.goals_against += hG;

    if (hG > aG) {
      h.won++; h.points += 3;
      a.lost++;
    } else if (hG === aG) {
      h.drawn++; h.points += 1;
      a.drawn++; a.points += 1;
    } else {
      h.lost++;
      a.won++; a.points += 3;
    }
  });

  // Calculate GD
  Object.values(statsMap).forEach(s => {
    s.goal_difference = s.goals_for - s.goals_against;
  });

  // Convert to array
  const standings = Object.values(statsMap);

  // Sorting function
  standings.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;
    // 2. Goal Difference
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    // 3. Goals For
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;

    // 4 & 5. Head-to-Head calculations
    const h2hFixtures = completedFixtures.filter(f => 
      (f.home_team_id === a.team_id && f.away_team_id === b.team_id) ||
      (f.home_team_id === b.team_id && f.away_team_id === a.team_id)
    );

    let aH2hPts = 0; let aH2hAway = 0;
    let bH2hPts = 0; let bH2hAway = 0;

    h2hFixtures.forEach(f => {
      const hG = f.home_goals || 0;
      const aG = f.away_goals || 0;

      if (f.home_team_id === a.team_id) {
        if (hG > aG) aH2hPts += 3;
        else if (hG === aG) { aH2hPts += 1; bH2hPts += 1; }
        else bH2hPts += 3;
        bH2hAway += aG;
      } else {
        if (aG > hG) aH2hPts += 3;
        else if (aG === hG) { aH2hPts += 1; bH2hPts += 1; }
        else bH2hPts += 3;
        aH2hAway += aG;
      }
    });

    if (bH2hPts !== aH2hPts) return bH2hPts - aH2hPts;
    if (bH2hAway !== aH2hAway) return bH2hAway - aH2hAway;

    // Tie
    return 0;
  });

  return standings;
};
