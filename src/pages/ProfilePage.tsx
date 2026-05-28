/**
 * ProfilePage Component
 *
 * User profile management with database integration.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, Camera, Award, Zap, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile, getGoals, createGoal, deleteGoal, getUserStats } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSpinner';
import type { Profile, Goal, UserStats } from '../types/database';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  // Profile state
  const [localProfile, setLocalProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  const [addingGoal, setAddingGoal] = useState(false);

  // Stats state
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Preferences state
  const [preferences, setPreferences] = useState<string[]>([]);
  const [newPref, setNewPref] = useState('');
  const [addingPref, setAddingPref] = useState(false);

  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme !== 'light');
    setMounted(true);
  }, []);

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      setProfileLoading(true);
      const data = await getProfile(user.id);
      setLocalProfile(data);
      setPreferences(data?.preferences || []);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  // Load goals
  const loadGoals = useCallback(async () => {
    if (!user) return;
    try {
      setGoalsLoading(true);
      const data = await getGoals(user.id);
      setGoals(data);
    } catch (err) {
      console.error('Error loading goals:', err);
    } finally {
      setGoalsLoading(false);
    }
  }, [user]);

  // Load stats
  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      setStatsLoading(true);
      const data = await getUserStats(user.id);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadProfile();
    loadGoals();
    loadStats();
  }, [loadProfile, loadGoals, loadStats]);

  // Use profile from auth if available
  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
      setPreferences(profile.preferences || []);
    }
  }, [profile]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const avatarUrl = event.target?.result as string;
        try {
          setSavingProfile(true);
          await updateProfile(user.id, { avatar_url: avatarUrl });
          setLocalProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
          refreshProfile();
        } catch (err) {
          console.error('Error updating avatar:', err);
        } finally {
          setSavingProfile(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Update profile name
  const handleUpdateName = async (name: string) => {
    if (!user) return;
    try {
      setSavingProfile(true);
      await updateProfile(user.id, { name });
      setLocalProfile(prev => prev ? { ...prev, name } : null);
      refreshProfile();
    } catch (err) {
      console.error('Error updating name:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Update profile bio
  const handleUpdateBio = async (bio: string) => {
    if (!user) return;
    try {
      setSavingProfile(true);
      await updateProfile(user.id, { bio });
      setLocalProfile(prev => prev ? { ...prev, bio } : null);
      refreshProfile();
    } catch (err) {
      console.error('Error updating bio:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Add preference
  const handleAddPreference = async () => {
    if (!newPref.trim() || !user) return;
    try {
      setAddingPref(true);
      const newPreferences = [...preferences, newPref.trim()];
      await updateProfile(user.id, { preferences: newPreferences });
      setPreferences(newPreferences);
      setNewPref('');
    } catch (err) {
      console.error('Error adding preference:', err);
    } finally {
      setAddingPref(false);
    }
  };

  // Remove preference
  const handleRemovePreference = async (index: number) => {
    if (!user) return;
    try {
      const newPreferences = preferences.filter((_, i) => i !== index);
      await updateProfile(user.id, { preferences: newPreferences });
      setPreferences(newPreferences);
    } catch (err) {
      console.error('Error removing preference:', err);
    }
  };

  // Add goal
  const handleAddGoal = async () => {
    if (!newGoal.trim() || !user) return;
    try {
      setAddingGoal(true);
      const newGoalItem = await createGoal(user.id, newGoal.trim());
      setGoals(prev => [newGoalItem, ...prev]);
      setNewGoal('');
    } catch (err) {
      console.error('Error adding goal:', err);
    } finally {
      setAddingGoal(false);
    }
  };

  // Remove goal
  const handleRemoveGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      console.error('Error removing goal:', err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Profile hero */}
      <div className={`relative overflow-hidden backdrop-blur-2xl border rounded-[2rem] transition-all duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-emerald-500/15 via-white/5 to-teal-500/10 border-white/10 shadow-2xl shadow-emerald-500/20'
          : 'bg-gradient-to-br from-emerald-500/5 via-white/80 to-teal-500/5 border-white/60 shadow-2xl shadow-slate-900/10'
      }`}>
        {/* Cover gradient */}
        <div className="relative h-40 md:h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
              isDark ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-black/20 text-white hover:bg-black/30'
            }`}>
              <SettingsIcon size={18} />
              <span className="text-sm font-semibold">Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Profile content */}
        <div className="relative px-6 md:px-10 pb-8">
          {/* Avatar */}
          <div className="flex flex-col md:flex-row gap-6 md:-mt-20 mb-6">
            <div className="relative group flex-shrink-0">
              <div className={`absolute inset-0 rounded-3xl ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-500/20'} blur-2xl group-hover:blur-3xl transition-all duration-300`} />
              <div className={`relative w-40 h-40 md:w-48 md:h-48 rounded-3xl border-4 overflow-hidden shadow-2xl ${
                isDark ? 'border-slate-900' : 'border-white'
              }`}>
                {profileLoading ? (
                  <LoadingSkeleton className="w-full h-full" />
                ) : (
                  <img
                    src={localProfile?.avatar_url || 'https://images.pexels.com/photos/220453/portrait-young-beautiful-woman-220453.jpeg'}
                    alt="Profile"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={savingProfile}
                  className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                    isDark ? 'bg-black/60' : 'bg-slate-900/60'
                  } disabled:opacity-50`}
                >
                  {savingProfile ? (
                    <Loader2 size={28} className="animate-spin text-white" />
                  ) : (
                    <div className="text-center">
                      <Camera size={28} className="text-white mx-auto mb-2" />
                      <span className="text-white text-sm font-semibold">Change Photo</span>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse" />
            </div>

            {/* Profile info */}
            <div className="flex-1 pt-4 md:pt-12">
              {profileLoading ? (
                <div className="space-y-3">
                  <LoadingSkeleton className="h-12 w-64" />
                  <LoadingSkeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={localProfile?.name || ''}
                    onChange={(e) => setLocalProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    onBlur={(e) => handleUpdateName(e.target.value)}
                    className={`text-3xl md:text-4xl font-bold bg-transparent border-b-2 pb-2 outline-none transition-all duration-300 w-full ${
                      isDark
                        ? 'text-white border-white/20 hover:border-white/40 focus:border-emerald-500/50'
                        : 'text-slate-900 border-slate-300/50 hover:border-slate-400 focus:border-emerald-500'
                    }`}
                  />
                  <textarea
                    value={localProfile?.bio || ''}
                    onChange={(e) => setLocalProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    onBlur={(e) => handleUpdateBio(e.target.value)}
                    className={`w-full mt-3 rounded-2xl px-5 py-3 outline-none transition-all duration-300 resize-none min-h-20 border-2 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
                        : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Focus Hours', value: stats?.total_focus_hours ? `${stats.total_focus_hours.toFixed(1)}h` : '0h', icon: Zap, color: 'emerald', trend: '+12h' },
              { label: 'Best Streak', value: stats?.best_streak?.toString() || '0', icon: Award, color: 'orange', trend: 'days' },
              { label: 'Tasks Done', value: stats?.tasks_completed?.toString() || '0', icon: Award, color: 'cyan', trend: 'total' },
              { label: 'Focus Score', value: stats?.focus_score ? `${stats.focus_score}%` : '0%', icon: Zap, color: 'teal', trend: '+5%' },
            ].map(({ label, value, icon: Icon, color, trend }) => (
              <div
                key={label}
                className={`group backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 hover:scale-105 ${
                  isDark ? `bg-white/5 border-white/10 hover:border-${color}-500/30` : 'bg-white/60 border-white/40 hover:shadow-lg'
                }`}
              >
                <Icon size={18} className={`mb-3 ${
                  color === 'emerald' ? isDark ? 'text-emerald-400' : 'text-emerald-600' :
                  color === 'orange' ? isDark ? 'text-orange-400' : 'text-orange-600' :
                  color === 'cyan' ? isDark ? 'text-cyan-400' : 'text-cyan-600' :
                  isDark ? 'text-teal-400' : 'text-teal-600'
                }`} />
                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
                {statsLoading ? (
                  <LoadingSkeleton className="h-7 w-16" />
                ) : (
                  <div className="flex items-end justify-between">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
                    <div className={`text-xs font-semibold ${
                      color === 'emerald' ? isDark ? 'text-emerald-400' : 'text-emerald-600' :
                      color === 'orange' ? isDark ? 'text-orange-400' : 'text-orange-600' :
                      color === 'cyan' ? isDark ? 'text-cyan-400' : 'text-cyan-600' :
                      isDark ? 'text-teal-400' : 'text-teal-600'
                    }`}>{trend}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Workspace preferences */}
        <div className={`backdrop-blur-2xl border rounded-3xl p-8 transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-white/10 hover:border-white/15'
            : 'bg-white/60 border-white/40 hover:shadow-xl'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
              <Zap size={20} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
            </div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Workspace Preferences</h3>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {preferences.map((pref, idx) => (
              <div
                key={idx}
                className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 ${
                  isDark
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-white hover:bg-emerald-500/30'
                    : 'bg-emerald-100/50 border border-emerald-200 text-slate-900 hover:bg-emerald-100/70'
                }`}
              >
                <span className="text-sm font-medium">{pref}</span>
                <button
                  onClick={() => handleRemovePreference(idx)}
                  className={`opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 ${
                    isDark ? 'hover:text-red-400' : 'hover:text-red-500'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={newPref}
              onChange={(e) => setNewPref(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPreference()}
              placeholder="Add preference..."
              disabled={addingPref}
              className={`flex-1 border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
                  : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
              } disabled:opacity-50`}
            />
            <button
              onClick={handleAddPreference}
              disabled={addingPref || !newPref.trim()}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingPref ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Add
            </button>
          </div>
        </div>

        {/* Saved goals */}
        <div className={`backdrop-blur-2xl border rounded-3xl p-8 transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-white/10 hover:border-white/15'
            : 'bg-white/60 border-white/40 hover:shadow-xl'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}`}>
              <Award size={20} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
            </div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Saved Goals</h3>
          </div>

          <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
            {goalsLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <LoadingSkeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : goals.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No goals set yet</p>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`group flex items-center justify-between rounded-xl px-5 py-4 transition-all duration-300 ${
                    isDark
                      ? 'bg-cyan-500/20 border border-cyan-500/30 text-white hover:bg-cyan-500/30'
                      : 'bg-cyan-100/50 border border-cyan-200 text-slate-900 hover:bg-cyan-100/70'
                  }`}
                >
                  <span className="text-sm font-medium">{goal.title}</span>
                  <button
                    onClick={() => handleRemoveGoal(goal.id)}
                    className={`opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 ${
                      isDark ? 'hover:text-red-400' : 'hover:text-red-500'
                    }`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
              placeholder="Add new goal..."
              disabled={addingGoal}
              className={`flex-1 border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50'
                  : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
              } disabled:opacity-50`}
            />
            <button
              onClick={handleAddGoal}
              disabled={addingGoal || !newGoal.trim()}
              className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingGoal ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
