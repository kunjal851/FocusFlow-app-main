/**
 * Supabase Client Configuration
 *
 * This file sets up the Supabase client for database operations.
 * The client handles authentication, database queries, and real-time subscriptions.
 *
 * Resilience / Mock Mode:
 * If VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or contains placeholder values,
 * this client automatically switches to a high-fidelity Local Mock Mode backed by localStorage.
 * This ensures the app is fully functional out of the box without complex backend setup.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Determine if we should fall back to Local Mock Mode
const isMockMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('placeholder') ||
  supabaseUrl.includes('your-') ||
  supabaseAnonKey.includes('placeholder') ||
  supabaseAnonKey.includes('your-');

// ============================================
// High-Fidelity Local Mock Supabase Client
// ============================================

let authListeners: Array<(event: string, session: any) => void> = [];

function getMockSession() {
  const sessionStr = localStorage.getItem('mock_sb_session');
  return sessionStr ? JSON.parse(sessionStr) : null;
}

function setMockSession(session: any) {
  if (session) {
    localStorage.setItem('mock_sb_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('mock_sb_session');
  }

  // Trigger auth state change notifications
  const event = session ? 'SIGNED_IN' : 'SIGNED_OUT';
  authListeners.forEach(listener => {
    try {
      listener(event, session);
    } catch (e) {
      console.error('Error in auth state change listener:', e);
    }
  });
}

class MockQueryBuilder {
  tableName: string;
  filters: Array<(item: any) => boolean> = [];
  sortField: string | null = null;
  ascending: boolean = true;
  limitCount: number | null = null;
  isSingle: boolean = false;
  isMaybeSingle: boolean = false;
  isCountHead: boolean = false;
  insertData: any = null;
  updateData: any = null;
  deleteFlag: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_columns?: string, options?: any) {
    if (options?.count === 'exact' && options?.head === true) {
      this.isCountHead = true;
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(item => item[column] === value);
    return this;
  }

  is(column: string, value: any) {
    if (value === null) {
      this.filters.push(item => item[column] === null || item[column] === undefined);
    } else {
      this.filters.push(item => item[column] === value);
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sortField = column;
    this.ascending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data: any) {
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  delete() {
    this.deleteFlag = true;
    return this;
  }

  // Promise-like thenable so the chain can be awaited directly
  async then(resolve: any, reject?: any) {
    try {
      const res = await this.execute();
      return resolve(res);
    } catch (err) {
      if (reject) return reject(err);
      throw err;
    }
  }

  async execute() {
    const storageKey = `mock_sb_${this.tableName}`;
    let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const currentSession = getMockSession();
    const userId = currentSession?.user?.id || 'mock-user-id';

    // Populate initial default data if table is completely empty
    if (items.length === 0) {
      if (this.tableName === 'profiles') {
        items = [{
          id: userId,
          name: currentSession?.user?.user_metadata?.name || 'Developer Mode',
          bio: 'FocusFlow enthusiast and developer extraordinaire!',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
          preferences: ['Dark Mode', 'Sound Effects', 'Daily Goals'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }];
        localStorage.setItem(storageKey, JSON.stringify(items));
      } else if (this.tableName === 'user_stats') {
        items = [{
          id: 'mock-stats-id',
          user_id: userId,
          total_focus_hours: 12.5,
          current_streak: 3,
          best_streak: 7,
          tasks_completed: 18,
          focus_score: 85,
          updated_at: new Date().toISOString()
        }];
        localStorage.setItem(storageKey, JSON.stringify(items));
      } else if (this.tableName === 'tasks') {
        items = [
          { id: '1', user_id: userId, title: 'Complete onboarding walkthrough', completed: true, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
          { id: '2', user_id: userId, title: 'Design premium glassmorphic dashboard', completed: false, created_at: new Date().toISOString() },
          { id: '3', user_id: userId, title: 'Integrate offline-first Mock Supabase Layer', completed: true, created_at: new Date(Date.now() - 3600000).toISOString() }
        ];
        localStorage.setItem(storageKey, JSON.stringify(items));
      } else if (this.tableName === 'blocked_apps') {
        items = [
          { id: 'app-1', user_id: userId, app_name: 'YouTube', created_at: new Date().toISOString() },
          { id: 'app-2', user_id: userId, app_name: 'Twitter / X', created_at: new Date().toISOString() }
        ];
        localStorage.setItem(storageKey, JSON.stringify(items));
      }
    }

    // Apply all filters in the chain
    let filtered = [...items];
    for (const filter of this.filters) {
      filtered = filtered.filter(filter);
    }

    // Handle Delete Operation
    if (this.deleteFlag) {
      const remaining = items.filter((item: any) => !filtered.some((f: any) => f.id === item.id));
      localStorage.setItem(storageKey, JSON.stringify(remaining));
      return { data: null, error: null, count: 0 };
    }

    // Handle Update Operation
    if (this.updateData) {
      const updatedItems = items.map((item: any) => {
        if (filtered.some((f: any) => f.id === item.id)) {
          return { ...item, ...this.updateData, updated_at: new Date().toISOString() };
        }
        return item;
      });
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));

      const updatedFiltered = updatedItems.filter((item: any) =>
        filtered.some((f: any) => f.id === item.id)
      );

      if (this.isSingle || this.isMaybeSingle) {
        return { data: updatedFiltered[0] || null, error: null };
      }
      return { data: updatedFiltered, error: null };
    }

    // Handle Insert Operation
    if (this.insertData) {
      const now = new Date().toISOString();
      const recordsToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const newRecords = recordsToInsert.map((rec: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        created_at: now,
        updated_at: now,
        ...rec
      }));

      items = [...newRecords, ...items];
      localStorage.setItem(storageKey, JSON.stringify(items));

      if (Array.isArray(this.insertData)) {
        return { data: newRecords, error: null };
      } else {
        return { data: newRecords[0], error: null };
      }
    }

    // Handle Count Head Query
    if (this.isCountHead) {
      return { data: null, error: null, count: filtered.length };
    }

    // Handle Sort Order
    if (this.sortField) {
      const field = this.sortField;
      filtered.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'string') {
          return this.ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return this.ascending ? (valA - valB) : (valB - valA);
      });
    }

    // Handle Limit
    if (this.limitCount !== null) {
      filtered = filtered.slice(0, this.limitCount);
    }

    // Handle Single Return Requests
    if (this.isSingle) {
      if (filtered.length === 0) {
        return { data: null, error: { message: 'Row not found' } };
      }
      return { data: filtered[0], error: null };
    }

    if (this.isMaybeSingle) {
      return { data: filtered[0] || null, error: null };
    }

    return { data: filtered, error: null };
  }
}

const mockSupabase = {
  auth: {
    async getSession() {
      const session = getMockSession();
      // If no session exists, create a default mock developer session for premium offline-first testing
      if (!session) {
        const defaultUser = {
          id: 'mock-user-id',
          email: 'developer@focusflow.local',
          user_metadata: { name: 'Developer Mode' },
          created_at: new Date().toISOString()
        };
        const defaultSession = {
          access_token: 'mock_token_dev',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock_refresh_dev',
          user: defaultUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        };
        setMockSession(defaultSession);
        return { data: { session: defaultSession }, error: null };
      }
      return { data: { session }, error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.push(callback);
      // Notify current state immediately
      const session = getMockSession();
      callback(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session);

      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners = authListeners.filter(l => l !== callback);
            }
          }
        }
      };
    },

    async signUp({ email, password, options }: any) {
      const users = JSON.parse(localStorage.getItem('mock_sb_users') || '[]');
      if (users.find((u: any) => u.email === email)) {
        return { data: { user: null, session: null }, error: new Error('User already exists') };
      }

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        user_metadata: options?.data || {},
        created_at: new Date().toISOString()
      };

      users.push({ ...newUser, password });
      localStorage.setItem('mock_sb_users', JSON.stringify(users));

      const mockSession = {
        access_token: 'mock_token_' + Math.random().toString(36).substr(2),
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh_' + Math.random().toString(36).substr(2),
        user: newUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };

      setMockSession(mockSession);
      return { data: { user: newUser, session: mockSession }, error: null };
    },

    async signInWithPassword({ email, password }: any) {
      const users = JSON.parse(localStorage.getItem('mock_sb_users') || '[]');
      // Allow the default developer account to always log in
      if (email === 'developer@focusflow.local' && password) {
        const defaultUser = {
          id: 'mock-user-id',
          email: 'developer@focusflow.local',
          user_metadata: { name: 'Developer Mode' },
          created_at: new Date().toISOString()
        };
        const mockSession = {
          access_token: 'mock_token_dev',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock_refresh_dev',
          user: defaultUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        };
        setMockSession(mockSession);
        return { data: { user: defaultUser, session: mockSession }, error: null };
      }

      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) {
        return { data: { user: null, session: null }, error: new Error('Invalid email or password') };
      }

      const { password: _, ...userWithoutPassword } = user;
      const mockSession = {
        access_token: 'mock_token_' + Math.random().toString(36).substr(2),
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh_' + Math.random().toString(36).substr(2),
        user: userWithoutPassword,
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };

      setMockSession(mockSession);
      return { data: { user: userWithoutPassword, session: mockSession }, error: null };
    },

    async signOut() {
      setMockSession(null);
      return { error: null };
    },

    async getUser() {
      const session = getMockSession();
      return { data: { user: session?.user || null }, error: null };
    }
  },

  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  }
};

// ============================================
// Initialization & Export
// ============================================

export const supabase = isMockMode
  ? (mockSupabase as any)
  : createClient<Database>(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

// Helper functions for getting current user/session
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};
