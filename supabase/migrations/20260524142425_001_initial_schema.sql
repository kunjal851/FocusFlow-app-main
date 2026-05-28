/*
  # Initial Schema Setup for FocusFlow

  1. New Tables
    - `profiles` - User profile information
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `preferences` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tasks` - Focus tasks
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
    
    - `timer_sessions` - Timer session history
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `activity` (text)
      - `duration_minutes` (integer)
      - `task_name` (text)
      - `completed` (boolean)
      - `started_at` (timestamp)
      - `ended_at` (timestamp)
    
    - `goals` - User goals
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
    
    - `notes` - User notes
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) - 'quick', 'reflection', 'goals'
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `blocked_apps` - Blocked apps for focus mode
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `app_name` (text)
      - `created_at` (timestamp)
    
    - `flow_sessions` - Flow state tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `mood` (text)
      - `duration_minutes` (integer)
      - `goal` (text)
      - `started_at` (timestamp)
      - `ended_at` (timestamp)
    
    - `user_stats` - Aggregated statistics
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `total_focus_hours` (decimal)
      - `current_streak` (integer)
      - `best_streak` (integer)
      - `tasks_completed` (integer)
      - `focus_score` (integer)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT 'https://images.pexels.com/photos/220453/portrait-young-beautiful-woman-220453.jpeg',
  preferences jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Timer sessions table
CREATE TABLE IF NOT EXISTS timer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity text NOT NULL,
  duration_minutes integer NOT NULL,
  task_name text,
  completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('quick', 'reflection', 'goals')),
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blocked apps table
CREATE TABLE IF NOT EXISTS blocked_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  app_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Flow sessions table
CREATE TABLE IF NOT EXISTS flow_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood text,
  duration_minutes integer DEFAULT 0,
  goal text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_focus_hours decimal DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  focus_score integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Timer sessions policies
CREATE POLICY "Users can view own timer sessions"
  ON timer_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own timer sessions"
  ON timer_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own timer sessions"
  ON timer_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Goals policies
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Notes policies
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Blocked apps policies
CREATE POLICY "Users can view own blocked apps"
  ON blocked_apps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own blocked apps"
  ON blocked_apps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own blocked apps"
  ON blocked_apps FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Flow sessions policies
CREATE POLICY "Users can view own flow sessions"
  ON flow_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own flow sessions"
  ON flow_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own flow sessions"
  ON flow_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User stats policies
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_id ON timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_started_at ON timer_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_apps_user_id ON blocked_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_sessions_user_id ON flow_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_sessions_started_at ON flow_sessions(started_at DESC);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, bio, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.pexels.com/photos/220453/portrait-young-beautiful-woman-220453.jpeg')
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
