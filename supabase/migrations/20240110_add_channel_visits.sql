-- Create channel_visits table
CREATE TABLE channel_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  channel_id UUID REFERENCES channels NOT NULL,
  last_visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, channel_id)
);

-- Enable RLS
ALTER TABLE channel_visits ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own visits
CREATE POLICY "Users can manage their own visits" ON channel_visits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id); 