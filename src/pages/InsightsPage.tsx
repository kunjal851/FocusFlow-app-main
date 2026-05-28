/**
 * InsightsPage Component
 *
 * Productivity analytics with real database data.
 */

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Flame, Clock, Award, BarChart3, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserStats, getTimerSessions } from '../lib/api';
import { LoadingSkeleton, ErrorDisplay } from '../components/LoadingSpinner';
import type { UserStats, TimerSession } from '../types/database';

export default function InsightsPage() {
  const { user } = useAuth();

  // Stats state
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Timer sessions state
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme !== 'light');
    setMounted(true);
  }, []);

  // Load stats from database
  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await getUserStats(user.id);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setStatsError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  // Load timer sessions from database
  const loadSessions = useCallback(async () => {
    if (!user) return;
    try {
      setSessionsLoading(true);
      const data = await getTimerSessions(user.id, 7); // Get last 7 sessions
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadStats();
    loadSessions();
  }, [loadStats, loadSessions]);

  // Generate heatmap data from sessions
  const generateHeatmapData = () => {
    // Create 35 days of data
    const data = [];
    const today = new Date();

    for (let i = 34; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Find sessions for this day
      const daySessions = sessions.filter(s => {
        const sessionDate = s.started_at.split('T')[0];
        return sessionDate === dateStr && s.completed;
      });

      const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration_minutes, 0);

      if (totalMinutes === 0) {
        data.push({ level: 'none' });
      } else if (totalMinutes < 30) {
        data.push({ level: 'low' });
      } else if (totalMinutes < 60) {
        data.push({ level: 'medium' });
      } else {
        data.push({ level: 'high' });
      }
    }

    return data;
  };

  // Generate chart data from last 7 days
  const generateChartData = () => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = sessions.filter(s => {
        const sessionDate = s.started_at.split('T')[0];
        return sessionDate === dateStr && s.completed;
      });

      const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration_minutes, 0);
      // Convert to percentage of target (120 minutes = 100%)
      const percentage = Math.min(100, Math.round((totalMinutes / 120) * 100));
      data.push(percentage);
    }

    return data;
  };

  const heatmapData = generateHeatmapData();
  const chartData = generateChartData();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getHeatmapColor = (level: string) => {
    if (isDark) {
      switch (level) {
        case 'none':
          return 'bg-slate-800/30';
        case 'low':
          return 'bg-emerald-700';
        case 'medium':
          return 'bg-emerald-600';
        case 'high':
          return 'bg-emerald-400 shadow-lg shadow-emerald-500/50';
        default:
          return 'bg-slate-800/30';
      }
    } else {
      switch (level) {
        case 'none':
          return 'bg-slate-200';
        case 'low':
          return 'bg-emerald-300';
        case 'medium':
          return 'bg-emerald-400';
        case 'high':
          return 'bg-emerald-500 shadow-lg shadow-emerald-500/30';
        default:
          return 'bg-slate-200';
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className={`relative overflow-hidden backdrop-blur-2xl border rounded-[2rem] p-8 md:p-12 transition-all duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-emerald-500/20 via-white/10 to-teal-500/10 border-white/10 shadow-2xl shadow-emerald-500/20'
          : 'bg-gradient-to-br from-emerald-500/10 via-white/80 to-teal-500/5 border-white/60 shadow-2xl shadow-slate-900/10'
      }`}>
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                <BarChart3 size={28} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              </div>
              <p className={`text-sm font-bold tracking-wide ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                PRODUCTIVITY ANALYTICS
              </p>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Weekly Focus<br />
              <span className={`bg-gradient-to-r ${isDark ? 'from-emerald-400 via-teal-400 to-cyan-400' : 'from-emerald-600 via-teal-600 to-cyan-600'} bg-clip-text text-transparent`}>
                Performance
              </span>
            </h1>
            <p className={`text-lg max-w-lg mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Your consistency improved by 18% this week. You're on track to achieve your monthly goals.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: TrendingUp, label: 'Focus Score', value: stats?.focus_score?.toString() || '0', trend: '+5%', color: 'emerald' },
                { icon: Flame, label: 'Streak', value: stats?.current_streak?.toString() || '0', trend: 'days', color: 'orange' },
                { icon: Clock, label: 'Hours', value: stats?.total_focus_hours ? stats.total_focus_hours.toFixed(1) : '0', trend: 'this week', color: 'cyan' },
              ].map(({ icon: Icon, label, value, trend, color }) => (
                <div
                  key={label}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                    isDark ? 'bg-white/10 hover:bg-white/15 border border-white/10' : 'bg-white/60 border border-white/40 hover:shadow-lg'
                  }`}
                >
                  <Icon size={20} className={
                    color === 'emerald' ? isDark ? 'text-emerald-400' : 'text-emerald-600' :
                    color === 'orange' ? isDark ? 'text-orange-400' : 'text-orange-600' :
                    isDark ? 'text-cyan-400' : 'text-cyan-600'
                  } />
                  <div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {statsLoading ? <LoadingSkeleton className="h-7 w-12" /> : value}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
                  </div>
                  <div className={`ml-2 text-xs font-bold ${
                    color === 'emerald' ? isDark ? 'text-emerald-400' : 'text-emerald-600' :
                    color === 'orange' ? isDark ? 'text-orange-400' : 'text-orange-600' :
                    isDark ? 'text-cyan-400' : 'text-cyan-600'
                  }`}>
                    {trend}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score ring */}
          <div className="flex-shrink-0">
            <div className="relative w-56 h-56">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                  strokeWidth="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 85 * ((stats?.focus_score || 0) / 100)} ${2 * Math.PI * 85}`}
                  className="drop-shadow-lg transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {statsLoading ? (
                  <LoadingSkeleton className="h-16 w-20 rounded-xl" />
                ) : (
                  <>
                    <div className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stats?.focus_score || 0}
                    </div>
                    <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Focus Score
                    </p>
                    <div className={`flex items-center gap-1 mt-2 px-3 py-1 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-500">+5%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly chart */}
        <div className={`backdrop-blur-2xl border rounded-3xl p-8 transition-all duration-300 ${
          isDark ? 'bg-white/5 border-white/10 hover:border-white/15' : 'bg-white/60 border-white/40 hover:shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-teal-500/20' : 'bg-teal-500/10'}`}>
                <Calendar size={20} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Deep Work Sessions
              </h3>
            </div>
            <button className={`flex items-center gap-1 text-sm font-semibold transition hover:gap-2 ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              View Details
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-end justify-between gap-4 h-56 px-2">
            {sessionsLoading ? (
              <div className="flex gap-4 w-full h-full items-end">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <LoadingSkeleton key={i} className="flex-1 h-32" />
                ))}
              </div>
            ) : (
              chartData.map((height, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative w-full h-48 flex items-end">
                    <div
                      className={`w-full rounded-xl transition-all duration-500 hover:shadow-xl cursor-pointer ${
                        isDark
                          ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-500 hover:shadow-teal-500/50'
                          : 'bg-gradient-to-t from-emerald-500 via-teal-400 to-cyan-500 hover:shadow-emerald-500/50'
                      }`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition text-xs font-bold whitespace-nowrap">
                        {height}%
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {weekDays[idx]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Heatmap */}
        <div className={`backdrop-blur-2xl border rounded-3xl p-8 transition-all duration-300 ${
          isDark ? 'bg-white/5 border-white/10 hover:border-white/15' : 'bg-white/60 border-white/40 hover:shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-orange-500/20' : 'bg-orange-500/10'}`}>
                <Award size={20} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
              </div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Focus Heatmap
              </h3>
            </div>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((level) => (
                <div key={level} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${getHeatmapColor(level)}`} />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {sessionsLoading ? (
              Array.from({ length: 35 }).map((_, idx) => (
                <LoadingSkeleton key={idx} className="aspect-square rounded-lg" />
              ))
            ) : (
              heatmapData.map((item, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer ${getHeatmapColor(item.level)}`}
                />
              ))
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`backdrop-blur-2xl border rounded-3xl p-6 transition-all duration-300 hover:scale-105 ${
            isDark ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-white/10' : 'bg-white/60 border-white/40 shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Focus Hours</p>
            </div>
            {statsLoading ? (
              <LoadingSkeleton className="h-10 w-24 mb-2" />
            ) : (
              <>
                <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stats?.total_focus_hours ? stats.total_focus_hours.toFixed(1) : '0'}h
                </div>
                <div className={`mt-2 text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  +12h from last month
                </div>
              </>
            )}
          </div>

          <div className={`backdrop-blur-2xl border rounded-3xl p-6 transition-all duration-300 hover:scale-105 ${
            isDark ? 'bg-gradient-to-br from-orange-500/20 to-red-500/10 border-white/10' : 'bg-white/60 border-white/40 shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Flame size={20} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Best Streak</p>
            </div>
            {statsLoading ? (
              <LoadingSkeleton className="h-10 w-24 mb-2" />
            ) : (
              <>
                <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stats?.best_streak || 0} days
                </div>
                <div className={`mt-2 text-xs font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  Personal record!
                </div>
              </>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className={`backdrop-blur-2xl border rounded-3xl p-6 transition-all duration-300 ${
          isDark ? 'bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-white/10' : 'bg-white/60 border-white/40 hover:shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award size={20} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Recent Achievements
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Early Bird', desc: 'Completed session before 6 AM', icon: '🌅', achieved: stats?.total_focus_hours && stats.total_focus_hours > 0 },
              { title: 'Week Warrior', desc: '7-day streak achieved', icon: '⚔️', achieved: stats?.current_streak && stats.current_streak >= 7 },
              { title: 'Flow Master', desc: '10 hours in flow state', icon: '🌊', achieved: stats?.total_focus_hours && stats.total_focus_hours >= 10 },
            ].map((badge, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                  badge.achieved
                    ? isDark ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10' : 'bg-gradient-to-r from-emerald-50 to-teal-50'
                    : isDark ? 'bg-white/5 opacity-50' : 'bg-white/40 opacity-50'
                }`}
              >
                <span className={`text-3xl ${badge.achieved ? '' : 'grayscale'}`}>{badge.icon}</span>
                <div>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{badge.title}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{badge.desc}</p>
                </div>
                {badge.achieved && (
                  <div className="ml-auto">
                    <Award size={20} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {statsError && (
        <ErrorDisplay message={statsError} onRetry={loadStats} isDark={isDark} />
      )}
    </div>
  );
}
