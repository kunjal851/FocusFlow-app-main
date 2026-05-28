/**
 * API Service Layer
 *
 * This file provides a clean interface for all database operations.
 * It abstracts the Supabase client calls into reusable functions.
 */

import { supabase } from './supabase';
import type { Profile, Task, Goal, Note, BlockedApp, TimerSession, UserStats } from '../types/database';

// ============================================
// Profile Operations
// ============================================

/**
 * Get the current user's profile
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Update the current user's profile
 */
export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// Task Operations
// ============================================

/**
 * Get all tasks for the current user
 */
export const getTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Create a new task
 */
export const createTask = async (userId: string, title: string): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, title, completed: false })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a task
 */
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
};

// ============================================
// Goal Operations
// ============================================

/**
 * Get all goals for the current user
 */
export const getGoals = async (userId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Create a new goal
 */
export const createGoal = async (userId: string, title: string): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: userId, title, completed: false })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a goal
 */
export const deleteGoal = async (goalId: string): Promise<void> => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) throw error;
};

// ============================================
// Note Operations
// ============================================

/**
 * Get notes by type for the current user
 */
export const getNotes = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Create or update a note
 */
export const upsertNote = async (userId: string, type: Note['type'], content: string): Promise<Note> => {
  // Check if a note of this type already exists
  const { data: existingNote } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .maybeSingle();

  if (existingNote) {
    // Update existing note
    const { data, error } = await supabase
      .from('notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', existingNote.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new note
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: userId, type, content })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// Blocked Apps Operations
// ============================================

/**
 * Get all blocked apps for the current user
 */
export const getBlockedApps = async (userId: string): Promise<BlockedApp[]> => {
  const { data, error } = await supabase
    .from('blocked_apps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Add a blocked app
 */
export const addBlockedApp = async (userId: string, appName: string): Promise<BlockedApp> => {
  const { data, error } = await supabase
    .from('blocked_apps')
    .insert({ user_id: userId, app_name: appName })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Remove a blocked app
 */
export const removeBlockedApp = async (appId: string): Promise<void> => {
  const { error } = await supabase
    .from('blocked_apps')
    .delete()
    .eq('id', appId);

  if (error) throw error;
};

// ============================================
// Timer Session Operations
// ============================================

/**
 * Create a new timer session
 */
export const createTimerSession = async (userId: string, activity: string, duration: number, taskName?: string): Promise<TimerSession> => {
  const { data, error } = await supabase
    .from('timer_sessions')
    .insert({
      user_id: userId,
      activity,
      duration_minutes: duration,
      task_name: taskName || null,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Complete a timer session
 */
export const completeTimerSession = async (sessionId: string): Promise<TimerSession> => {
  const { data, error } = await supabase
    .from('timer_sessions')
    .update({
      ended_at: new Date().toISOString(),
      completed: true,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get recent timer sessions
 */
export const getTimerSessions = async (userId: string, limit: number = 10): Promise<TimerSession[]> => {
  const { data, error } = await supabase
    .from('timer_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// ============================================
// User Stats Operations
// ============================================

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Update user statistics
 */
export const updateUserStats = async (userId: string, updates: Partial<UserStats>): Promise<UserStats> => {
  const { data, error } = await supabase
    .from('user_stats')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Calculate and update user statistics
 * This is called after completing tasks or sessions
 */
export const recalculateUserStats = async (userId: string): Promise<UserStats> => {
  // Get completed tasks count
  const { count: completedTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true);

  // Get total focus hours from timer sessions
  const { data: sessions } = await supabase
    .from('timer_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('completed', true);

  const totalMinutes = (sessions as Pick<TimerSession, 'duration_minutes'>[] | null)?.reduce(
    (sum: number, session) => sum + session.duration_minutes,
    0
  ) || 0;
  const totalHours = totalMinutes / 60;

  // Get current stats for streak info
  const currentStats = await getUserStats(userId);

  // Calculate focus score (simplified calculation)
  const focusScore = Math.min(100, Math.round(
    (completedTasks || 0) * 2 +
    totalHours * 0.5 +
    (currentStats?.current_streak || 0) * 2
  ));

  // Update stats
  const updates: Partial<UserStats> = {
    tasks_completed: completedTasks || 0,
    total_focus_hours: totalHours,
    focus_score: focusScore,
  };

  return updateUserStats(userId, updates);
};
