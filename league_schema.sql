-- 1. Create Leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    season TEXT,
    status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'completed')),
    total_teams INTEGER NOT NULL CHECK (total_teams IN (4, 5, 6, 8)),
    match_duration_minutes INTEGER,
    ground_name TEXT
);

-- 2. Create Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    captain_player_id UUID,
    total_players INTEGER DEFAULT 0
);

-- 3. Create League Players table
CREATE TABLE IF NOT EXISTS public.league_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    age INTEGER,
    position TEXT NOT NULL CHECK (position IN ('goalkeeper', 'defender', 'midfielder', 'forward')),
    skill_level INTEGER NOT NULL CHECK (skill_level BETWEEN 1 AND 5),
    goals_scored INTEGER DEFAULT 0
);

-- Foreign key for captains now that players table exists
ALTER TABLE public.teams ADD CONSTRAINT fk_captain FOREIGN KEY (captain_player_id) REFERENCES public.league_players(id) ON DELETE SET NULL;

-- 4. Create Fixtures table
CREATE TABLE IF NOT EXISTS public.fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    matchday_number INTEGER NOT NULL,
    home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    scheduled_date DATE,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')),
    home_goals INTEGER DEFAULT 0 CHECK (home_goals >= 0),
    away_goals INTEGER DEFAULT 0 CHECK (away_goals >= 0),
    entered_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create Standings table
CREATE TABLE IF NOT EXISTS public.standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0
);

-- 6. Create Goal Events table
CREATE TABLE IF NOT EXISTS public.goal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    fixture_id UUID REFERENCES public.fixtures(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.league_players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    minute INTEGER,
    type TEXT NOT NULL DEFAULT 'normal' CHECK (type IN ('normal', 'own_goal'))
);

-- 7. Enable RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_events ENABLE ROW LEVEL SECURITY;

-- 8. Apply permissive policies for Anon access (handles its own frontend lock)
CREATE POLICY "Allow anon select on leagues" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on leagues" ON public.leagues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on leagues" ON public.leagues FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on leagues" ON public.leagues FOR DELETE USING (true);

CREATE POLICY "Allow anon select on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on teams" ON public.teams FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on teams" ON public.teams FOR DELETE USING (true);

CREATE POLICY "Allow anon select on league_players" ON public.league_players FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on league_players" ON public.league_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on league_players" ON public.league_players FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on league_players" ON public.league_players FOR DELETE USING (true);

CREATE POLICY "Allow anon select on fixtures" ON public.fixtures FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on fixtures" ON public.fixtures FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on fixtures" ON public.fixtures FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on fixtures" ON public.fixtures FOR DELETE USING (true);

CREATE POLICY "Allow anon select on standings" ON public.standings FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on standings" ON public.standings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on standings" ON public.standings FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on standings" ON public.standings FOR DELETE USING (true);

CREATE POLICY "Allow anon select on goal_events" ON public.goal_events FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on goal_events" ON public.goal_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on goal_events" ON public.goal_events FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on goal_events" ON public.goal_events FOR DELETE USING (true);
