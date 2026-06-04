CREATE TABLE IF NOT EXISTS global_leaderboard (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  points integer DEFAULT 0,
  tournaments_played integer DEFAULT 0,
  tournaments_won integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view global leaderboard"
  ON global_leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own stats"
  ON global_leaderboard FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON global_leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
  ON global_leaderboard
  USING (true)
  WITH CHECK (true);
