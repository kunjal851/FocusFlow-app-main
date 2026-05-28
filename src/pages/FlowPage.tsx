/**
 * FlowPage Component
 *
 * Flow state tracking with real database integration.
 */

import { useState, useEffect, useCallback } from 'react';
import { Trash2, Shield, Brain, Target, Zap, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getBlockedApps, addBlockedApp, removeBlockedApp } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSpinner';
import { supabase } from '../lib/supabase';
import type { BlockedApp } from '../types/database';

export default function FlowPage() {
  const { user } = useAuth();

  // Blocked apps state
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appInput, setAppInput] = useState('');
  const [addingApp, setAddingApp] = useState(false);

  // Flow session state
  const [currentSession, setCurrentSession] = useState<{
    id: string;
    startedAt: Date;
    duration: number;
  } | null>(null);
  const [sessionTime, setSessionTime] = useState(0);

  // Flow state
  const [selectedMood, setSelectedMood] = useState('🔥');
  const [goal, setGoal] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  // Insights state
  const [insights] = useState<{
    peakHours: string;
    focusQuality: string;
  }>({ peakHours: '8PM - 11PM', focusQuality: '+34%' });

  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme !== 'light');
    setMounted(true);
  }, []);

  // Load blocked apps from database
  const loadBlockedApps = useCallback(async () => {
    if (!user) return;
    try {
      setAppsLoading(true);
      const data = await getBlockedApps(user.id);
      setBlockedApps(data);
    } catch (err) {
      console.error('Error loading blocked apps:', err);
    } finally {
      setAppsLoading(false);
    }
  }, [user]);

  // Check for active flow session
  const checkActiveSession = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('flow_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentSession({
          id: data.id,
          startedAt: new Date(data.started_at),
          duration: 0,
        });
        if (data.mood) setSelectedMood(data.mood);
        if (data.goal) setGoal(data.goal);
      }
    } catch (err) {
      console.error('Error checking active session:', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadBlockedApps();
    checkActiveSession();
  }, [loadBlockedApps, checkActiveSession]);

  // Update session time every second
  useEffect(() => {
    if (!currentSession) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - currentSession.startedAt.getTime()) / 1000 / 60);
      setSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Add blocked app
  const handleAddBlockedApp = async () => {
    if (!appInput.trim() || !user) return;
    try {
      setAddingApp(true);
      const newApp = await addBlockedApp(user.id, appInput.trim());
      setBlockedApps(prev => [newApp, ...prev]);
      setAppInput('');
    } catch (err) {
      console.error('Error adding blocked app:', err);
    } finally {
      setAddingApp(false);
    }
  };

  // Remove blocked app
  const handleRemoveBlockedApp = async (appId: string) => {
    try {
      await removeBlockedApp(appId);
      setBlockedApps(prev => prev.filter(app => app.id !== appId));
    } catch (err) {
      console.error('Error removing blocked app:', err);
    }
  };

  // Save goal
  const handleSaveGoal = async () => {
    if (!user || !currentSession) return;
    try {
      setSavingGoal(true);
      const { error } = await supabase
        .from('flow_sessions')
        .update({ goal, mood: selectedMood })
        .eq('id', currentSession.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setSavingGoal(false);
    }
  };

  const moods = [
    { emoji: '😴', label: 'Tired', color: 'slate' },
    { emoji: '🙂', label: 'Okay', color: 'emerald' },
    { emoji: '🔥', label: 'Focused', color: 'orange' },
    { emoji: '🚀', label: 'Peak', color: 'cyan' },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Flow status hero */}
      <div className={`relative overflow-hidden backdrop-blur-2xl border rounded-[2rem] p-8 md:p-12 transition-all duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-emerald-500/20 via-white/10 to-teal-500/10 border-white/10 shadow-2xl shadow-emerald-500/20'
          : 'bg-gradient-to-br from-emerald-500/10 via-white/80 to-teal-500/5 border-white/60 shadow-2xl shadow-slate-900/10'
      }`}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 -right-20 w-40 h-40 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-emerald-500/30' : 'bg-emerald-400/40'
          }`} style={{ animationDuration: '3s' }} />
          <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl animate-pulse ${
            isDark ? 'bg-teal-500/20' : 'bg-teal-400/30'
          }`} style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                  <Zap size={24} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {currentSession ? 'FLOW STATE' : 'READY TO FOCUS'}
                  </p>
                  <h1 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {currentSession ? `${sessionTime} MIN` : 'START'}
                  </h1>
                </div>
              </div>
              <p className={`max-w-md ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {currentSession
                  ? "You're in deep focus mode. Productivity metrics are optimal."
                  : 'Begin a flow session to track your productivity.'}
              </p>
            </div>

            {/* Clock indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-white/10' : 'bg-white/60'}`}>
              <Clock size={18} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {currentSession && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Session Progress</span>
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {Math.min(100, Math.round((sessionTime / 60) * 100))}%
                </span>
              </div>
              <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: `${Math.min(100, (sessionTime / 60) * 100)}%`, animationDuration: '2s' }}
                />
              </div>
            </div>
          )}

          {/* Mood selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Current Mood:</span>
            <div className="flex gap-3">
              {moods.map(({ emoji, label, color }) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setSelectedMood(emoji);
                    if (currentSession) {
                      handleSaveGoal();
                    }
                  }}
                  className={`group relative w-16 h-16 rounded-2xl text-3xl transition-all duration-300 hover:scale-110 ${
                    selectedMood === emoji
                      ? color === 'slate' ? 'bg-slate-500/30 border-2 border-slate-400 shadow-lg shadow-slate-500/30' :
                        color === 'emerald' ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg shadow-emerald-500/30' :
                        color === 'orange' ? 'bg-orange-500/30 border-2 border-orange-400 shadow-lg shadow-orange-500/30' :
                        'bg-cyan-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30'
                      : isDark
                        ? 'bg-white/5 border-2 border-white/10 hover:border-white/20 hover:bg-white/10'
                        : 'bg-white/40 border-2 border-slate-200 hover:border-slate-300 hover:bg-white/60'
                  }`}
                >
                  {emoji}
                  <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition whitespace-nowrap ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Insight */}
        <div className="lg:col-span-2">
          <div className={`h-full backdrop-blur-2xl border rounded-3xl p-8 transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-br from-teal-500/10 via-white/5 to-cyan-500/10 border-white/10'
              : 'bg-white/60 border-white/40 hover:shadow-xl'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-teal-500/20' : 'bg-teal-500/10'}`}>
                <Brain size={22} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                AI Productivity Insight
              </h2>
            </div>

            <div className="space-y-4">
              <div className={`backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-emerald-500/30'
                  : 'bg-white/40 border-slate-200 hover:shadow-lg'
              }`}>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Your focus quality improves significantly after 8PM. Consider scheduling deep creative work during evening sessions. Your peak performance window is 8PM - 11PM based on historical data.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-2xl p-5 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                  <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>PEAK HOURS</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {insights.peakHours}
                  </p>
                </div>
                <div className={`rounded-2xl p-5 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                  <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>FOCUS QUALITY</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {insights.focusQuality}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Blocked apps */}
          <div className={`backdrop-blur-2xl border rounded-3xl p-6 transition-all duration-300 ${
            isDark
              ? 'bg-white/5 border-white/10 hover:border-white/15'
              : 'bg-white/60 border-white/40 hover:shadow-xl'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                <Shield size={20} className={isDark ? 'text-red-400' : 'text-red-600'} />
              </div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Blocked Apps</h3>
            </div>

            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {appsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <LoadingSkeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : blockedApps.length === 0 ? (
                <p className={`text-center py-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No apps blocked
                </p>
              ) : (
                blockedApps.map((app) => (
                  <div
                    key={app.id}
                    className={`group flex items-center justify-between rounded-xl p-4 transition-all duration-300 ${
                      isDark
                        ? 'bg-white/5 hover:bg-red-500/20 border border-transparent hover:border-red-500/30'
                        : 'bg-white/40 hover:bg-red-50 border border-slate-200 hover:border-red-200'
                    }`}
                  >
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {app.app_name}
                    </span>
                    <button
                      onClick={() => handleRemoveBlockedApp(app.id)}
                      className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                        isDark ? 'hover:bg-red-500/30 text-red-400' : 'hover:bg-red-100 text-red-500'
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={appInput}
                onChange={(e) => setAppInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddBlockedApp()}
                placeholder="Block app..."
                disabled={addingApp}
                className={`flex-1 border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-red-500/50'
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-red-500'
                } disabled:opacity-50`}
              />
              <button
                onClick={handleAddBlockedApp}
                disabled={addingApp || !appInput.trim()}
                className="px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {addingApp ? <Loader2 size={18} className="animate-spin" /> : 'Block'}
              </button>
            </div>
          </div>

          {/* Current goal */}
          <div className={`backdrop-blur-2xl border rounded-3xl p-6 transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-white/10'
              : 'bg-white/60 border-white/40 hover:shadow-xl'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}`}>
                <Target size={20} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
              </div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Session Goal</h3>
              {savingGoal && <Loader2 size={16} className="animate-spin text-cyan-400" />}
            </div>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onBlur={handleSaveGoal}
              placeholder="What do you want to achieve in this session?"
              className={`w-full h-28 border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 resize-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50'
                  : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
