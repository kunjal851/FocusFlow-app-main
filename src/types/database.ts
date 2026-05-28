/**
 * Database Types for FocusFlow
 *
 * These types represent the structure of our Supabase database tables.
 * They ensure type safety throughout the application.
 */

// User profile type
export interface Profile {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
  preferences: string[];
  created_at: string;
  updated_at: string;
}

// Task type for focus tasks
export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

// Timer session type for tracking focus sessions
export interface TimerSession {
  id: string;
  user_id: string;
  activity: string;
  duration_minutes: number;
  task_name: string | null;
  completed: boolean;
  started_at: string;
  ended_at: string | null;
}

// Goal type for user goals
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

// Note type for different note categories
export interface Note {
  id: string;
  user_id: string;
  type: 'quick' | 'reflection' | 'goals';
  content: string;
  created_at: string;
  updated_at: string;
}

// Blocked app type for focus mode
export interface BlockedApp {
  id: string;
  user_id: string;
  app_name: string;
  created_at: string;
}

// Flow session type for flow state tracking
export interface FlowSession {
  id: string;
  user_id: string;
  mood: string | null;
  duration_minutes: number;
  goal: string | null;
  started_at: string;
  ended_at: string | null;
}

// User statistics type for aggregated data
export interface UserStats {
  id: string;
  user_id: string;
  total_focus_hours: number;
  current_streak: number;
  best_streak: number;
  tasks_completed: number;
  focus_score: number;
  updated_at: string;
}

// Database tables mapping for type safety
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> };
      tasks: { Row: Task; Insert: Omit<Task, 'id' | 'created_at'>; Update: Partial<Task> };
      timer_sessions: { Row: TimerSession; Insert: Omit<TimerSession, 'id' | 'started_at'>; Update: Partial<TimerSession> };
      goals: { Row: Goal; Insert: Omit<Goal, 'id' | 'created_at'>; Update: Partial<Goal> };
      notes: { Row: Note; Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Note> };
      blocked_apps: { Row: BlockedApp; Insert: Omit<BlockedApp, 'id' | 'created_at'>; Update: Partial<BlockedApp> };
      flow_sessions: { Row: FlowSession; Insert: Omit<FlowSession, 'id' | 'started_at'>; Update: Partial<FlowSession> };
      user_stats: { Row: UserStats; Insert: Omit<UserStats, 'id' | 'updated_at'>; Update: Partial<UserStats> };
    };
  };
}
