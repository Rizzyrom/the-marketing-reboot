-- Create follows table
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(follower_id, contributor_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own follows"
  ON follows FOR SELECT
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can follow contributors"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow contributors"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Create indexes
CREATE INDEX follows_follower_id_idx ON follows(follower_id);
CREATE INDEX follows_contributor_id_idx ON follows(contributor_id); 