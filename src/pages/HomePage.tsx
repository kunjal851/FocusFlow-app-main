/**
 * HomePage Component
 *
 * Main dashboard showing tasks, stats, and notes.
 * Now connected to real database with Supabase.
 */

import { useState, useEffect, useCallback } from 'react';
import { Trash2, CheckCircle2, Circle, Sparkles, TrendingUp, Flame, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getTasks, createTask, updateTask, deleteTask, getNotes, upsertNote, getUserStats } from '../lib/api';
import { LoadingSkeleton, ErrorDisplay } from '../components/LoadingSpinner';
import type { Task, UserStats } from '../types/database';

export default function HomePage() {
  const { user } = useAuth();

  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // State for notes
  const [notes, setNotes] = useState<{ quick: string; reflection: string; goals: string }>({
    quick: '',
    reflection: '',
    goals: '',
  });
  const [notesLoading, setNotesLoading] = useState(true);
  const [savingNote, setSavingNote] = useState<string | null>(null);

  // State for stats
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme !== 'light');
    setMounted(true);
  }, []);

  // Load tasks from database
  const loadTasks = useCallback(async () => {
    if (!user) return;

    try {
      setTasksLoading(true);
      const data = await getTasks(user.id);
      setTasks(data);
      setTasksError(null);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setTasksError('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  }, [user]);

  // Load notes from database
  const loadNotes = useCallback(async () => {
    if (!user) return;

    try {
      setNotesLoading(true);
      const data = await getNotes(user.id);

      // Convert array to object with type as key
      const notesObj = { quick: '', reflection: '', goals: '' };
      data.forEach(note => {
        notesObj[note.type] = note.content;
      });
      setNotes(notesObj);
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setNotesLoading(false);
    }
  }, [user]);

  // Load stats from database
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

  // Initial data load
  useEffect(() => {
    loadTasks();
    loadNotes();
    loadStats();
  }, [loadTasks, loadNotes, loadStats]);

  // Listen for quick add task events
  useEffect(() => {
    const handleAddTask = async (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.trim() && user) {
        try {
          const newTask = await createTask(user.id, customEvent.detail);
          setTasks(prev => [newTask, ...prev]);
        } catch (err) {
          console.error('Error adding task:', err);
        }
      }
    };

    window.addEventListener('addTask', handleAddTask);
    return () => window.removeEventListener('addTask', handleAddTask);
  }, [user]);

  // Add a new task
  const handleAddTask = async () => {
    if (!taskInput.trim() || !user) return;

    try {
      setAddingTask(true);
      const newTask = await createTask(user.id, taskInput);
      setTasks(prev => [newTask, ...prev]);
      setTaskInput('');
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  // Toggle task completion
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed: !completed });
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, completed: !completed } : t))
      );
      // Update stats
      loadStats();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Update note
  const handleUpdateNote = async (key: keyof typeof notes, value: string) => {
    setNotes(prev => ({ ...prev, [key]: value }));

    if (!user) return;

    try {
      setSavingNote(key);
      await upsertNote(user.id, key, value);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSavingNote(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="relative">
        <div className={`backdrop-blur-2xl border rounded-3xl p-8 md:p-12 transition-all duration-500 ${
          isDark
            ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-2xl shadow-emerald-500/10'
            : 'bg-gradient-to-br from-white/80 to-white/40 border-white/60 shadow-2xl shadow-slate-900/10'
        }`}>
          <div className={`absolute top-0 right-0 w-32 h-32 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} rounded-bl-[100px]`} />

          <div className="relative">
            <div className="flex items-start gap-4 mb-8">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                <Sparkles className={isDark ? 'text-emerald-400' : 'text-emerald-600'} size={28} />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold mb-3 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Deep Work,<br />
                  <span className={`bg-gradient-to-r ${isDark ? 'from-emerald-400 via-teal-400 to-cyan-400' : 'from-emerald-600 via-teal-600 to-cyan-600'} bg-clip-text text-transparent`}>
                    Intelligent Flow
                  </span>
                </h1>
                <p className={`text-lg max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  AI-powered productivity workspace designed to maximize your focus and achieve your goals.
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Focus Score', value: stats?.focus_score ? `${stats.focus_score}%` : '0%', icon: TrendingUp, color: 'emerald', trend: '+5%' },
                { label: 'Current Streak', value: stats?.current_streak?.toString() || '0', icon: Flame, color: 'orange', trend: 'days' },
                { label: 'Tasks Done', value: stats?.tasks_completed?.toString() || '0', icon: CheckCircle2, color: 'cyan', trend: `${tasks.filter(t => t.completed).length}/${tasks.length}` },
                { label: 'Flow Hours', value: stats?.total_focus_hours ? `${stats.total_focus_hours.toFixed(1)}h` : '0h', icon: Sparkles, color: 'teal', trend: 'this week' },
              ].map(({ label, value, icon: Icon, color, trend }) => (
                <div key={label} className={`group relative overflow-hidden backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 hover:scale-105 ${
                  isDark ? `bg-white/5 border-white/10 hover:border-${color}-500/30` : 'bg-white/50 border-white/40 hover:shadow-lg'
                }`}>
                  <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full ${
                    color === 'emerald' ? 'bg-emerald-500/10' : color === 'orange' ? 'bg-orange-500/10' : color === 'cyan' ? 'bg-cyan-500/10' : 'bg-teal-500/10'
                  } transition-transform duration-300 group-hover:scale-150`} />
                  <div className="relative">
                    <Icon size={18} className={`mb-2 ${
                      color === 'emerald' ? 'text-emerald-400' : color === 'orange' ? 'text-orange-400' : color === 'cyan' ? 'text-cyan-400' : 'text-teal-400'
                    }`} />
                    {statsLoading ? (
                      <LoadingSkeleton className="h-8 w-16 mb-1" />
                    ) : (
                      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{label}</p>
                      <span className={`text-xs font-semibold ${
                        color === 'emerald' ? 'text-emerald-400' : color === 'orange' ? 'text-orange-400' : color === 'cyan' ? 'text-cyan-400' : 'text-teal-400'
                      }`}>{trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks card */}
        <div className="lg:col-span-2">
          <div className={`h-full backdrop-blur-2xl border rounded-3xl p-6 transition-all duration-300 ${
            isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white/60 border-white/40 hover:shadow-xl'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                <CheckCircle2 size={20} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Focus Tasks</h2>
            </div>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="What needs your focus?"
                disabled={addingTask}
                className={`flex-1 border-2 rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-white/10'
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                } disabled:opacity-50`}
              />
              <button
                onClick={handleAddTask}
                disabled={addingTask || !taskInput.trim()}
                className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {addingTask ? <Loader2 size={20} className="animate-spin" /> : 'Add'}
              </button>
            </div>

            {/* Tasks list */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <LoadingSkeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : tasksError ? (
                <ErrorDisplay message={tasksError} onRetry={loadTasks} isDark={isDark} />
              ) : tasks.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Circle size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No tasks yet. Add your first focus task!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                      task.completed
                        ? isDark ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'
                        : isDark ? 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10' : 'bg-white/40 hover:bg-white/60 border border-transparent hover:border-slate-200'
                    }`}
                    onClick={() => handleToggleTask(task.id, task.completed)}
                  >
                    <div className="flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle2 size={22} className="text-cyan-500" />
                      ) : (
                        <Circle size={22} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                      )}
                    </div>
                    <span className={`flex-1 transition-all duration-300 ${
                      task.completed ? 'line-through opacity-50' : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                      className={`opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                        isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notes sidebar */}
        <div className="space-y-6">
          {notesLoading ? (
            <>
              {[1, 2, 3].map(i => (
                <LoadingSkeleton key={i} className="h-40 w-full rounded-3xl" />
              ))}
            </>
          ) : (
            [
              { key: 'quick' as const, title: 'Quick Notes', icon: '📝', color: 'amber', gradient: 'from-amber-500/20 to-orange-500/20' },
              { key: 'reflection' as const, title: 'Reflections', icon: '💭', color: 'emerald', gradient: 'from-emerald-500/20 to-teal-500/20' },
              { key: 'goals' as const, title: 'Goals', icon: '🎯', color: 'cyan', gradient: 'from-cyan-500/20 to-teal-500/20' },
            ].map(({ key, title, icon, color, gradient }) => (
              <div
                key={key}
                className={`group backdrop-blur-2xl border rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                  isDark ? `bg-gradient-to-br ${gradient} border-white/10 hover:border-${color}-500/30` : 'bg-white/60 border-white/40 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{icon}</span>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                  {savingNote === key && <Loader2 size={16} className="animate-spin text-emerald-400" />}
                </div>
                <textarea
                  value={notes[key]}
                  onChange={(e) => handleUpdateNote(key, e.target.value)}
                  placeholder={`Write ${title.toLowerCase()}...`}
                  className={`w-full h-24 border-2 rounded-2xl px-4 py-3 outline-none transition-all duration-300 resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
                      : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
