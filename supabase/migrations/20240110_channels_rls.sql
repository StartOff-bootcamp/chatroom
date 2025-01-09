-- Enable RLS on channels table
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable admin access" ON channels;
DROP POLICY IF EXISTS "Enable read access for all users" ON channels;

-- Create policy for admins to manage channels (create, read, update, delete)
CREATE POLICY "Enable admin access" ON channels
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Create policy for all users to read channels
CREATE POLICY "Enable read access for all users" ON channels
  FOR SELECT
  TO authenticated
  USING (true); 