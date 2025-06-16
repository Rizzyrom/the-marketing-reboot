-- Update profiles table with role and verification
ALTER TABLE profiles
ADD COLUMN user_role TEXT NOT NULL DEFAULT 'reader' CHECK (user_role IN ('contributor', 'reader')),
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN verified_date TIMESTAMP WITH TIME ZONE;

-- Create saved_posts table
CREATE TABLE saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create contributor_applications table
CREATE TABLE contributor_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin TEXT,
  portfolio TEXT,
  why_contribute TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create RLS policies
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributor_applications ENABLE ROW LEVEL SECURITY;

-- Saved posts policies
CREATE POLICY "Users can view their own saved posts"
  ON saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their posts"
  ON saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Contributor applications policies
CREATE POLICY "Anyone can submit an application"
  ON contributor_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view applications"
  ON contributor_applications FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_role, is_verified)
  VALUES (new.id, 'reader', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 