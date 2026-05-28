// src/App.jsx

import { useState, useEffect } from 'react';
import {
  Home,
  Clock,
  Zap,
  BarChart3,
  User,
  Moon,
  Sun,
  Plus,
  X,
} from 'lucide-react';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginForm, SignupForm } from './components/Auth';
import { LoadingSpinner } from './components/LoadingSpinner';

import HomePage from './pages/HomePage';
import TimerPage from './pages/TimerPage';
import FlowPage from './pages/FlowPage';
import InsightsPage from './pages/InsightsPage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [mounted, setMounted] = useState(false);

  // FIXED LINE
  const [authMode, setAuthMode] = useState('login');

  const { user, loading } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const addQuickTask = () => {
    if (taskInput.trim()) {
      const event = new CustomEvent('addTask', {
        detail: taskInput,
      });

      window.dispatchEvent(event);

      setTaskInput('');
      setShowQuickAdd(false);
    }
  };

  const pages = {
    home: <HomePage />,
    timer: <TimerPage />,
    flow: <FlowPage />,
    insights: <InsightsPage />,
    profile: <ProfilePage />,
  };

  // LOADING
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark
            ? 'bg-black text-white'
            : 'bg-white text-black'
        }`}
      >
        <LoadingSpinner
          size="lg"
          message="Loading..."
          isDark={isDark}
        />
      </div>
    );
  }

  // LOGIN PAGE
  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          isDark
            ? 'bg-slate-950'
            : 'bg-slate-100'
        }`}
      >
        <div
          className={`w-full max-w-md rounded-3xl p-8 ${
            isDark
              ? 'bg-slate-900 text-white'
              : 'bg-white text-black'
          }`}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Zap size={30} className="text-white" />
            </div>

            <h1 className="text-3xl font-bold">
              FocusFlow
            </h1>

            <p className="mt-2 text-gray-400">
              Productivity Workspace
            </p>
          </div>

          {authMode === 'login' ? (
            <LoginForm
              isDark={isDark}
              onToggleMode={() =>
                setAuthMode('signup')
              }
            />
          ) : (
            <SignupForm
              isDark={isDark}
              onToggleMode={() =>
                setAuthMode('login')
              }
            />
          )}

          <div className="mt-6 text-center">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-emerald-500 text-white"
            >
              {isDark ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-slate-950 text-white'
          : 'bg-slate-100 text-black'
      }`}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-700">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>

            <h1 className="text-2xl font-bold">
              FocusFlow
            </h1>
          </div>

          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-emerald-500 text-white"
          >
            {isDark ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="px-6 py-6 pb-32">
       {pages[currentPage as keyof typeof pages]}
      </main>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg">
        <nav
          className={`rounded-2xl p-3 flex justify-around ${
            isDark
              ? 'bg-slate-900'
              : 'bg-white'
          }`}
        >
          {[
            {
              id: 'home',
              icon: Home,
              label: 'Home',
            },
            {
              id: 'timer',
              icon: Clock,
              label: 'Timer',
            },
            {
              id: 'flow',
              icon: Zap,
              label: 'Flow',
            },
            {
              id: 'insights',
              icon: BarChart3,
              label: 'Insights',
            },
            {
              id: 'profile',
              icon: User,
              label: 'Profile',
            },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`flex flex-col items-center gap-1 ${
                currentPage === id
                  ? 'text-emerald-500'
                  : 'text-gray-400'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs">
                {label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* FLOAT BUTTON */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed right-6 bottom-24 w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      {/* QUICK TASK MODAL */}
      {showQuickAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 ${
              isDark
                ? 'bg-slate-900'
                : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Add Task
              </h2>

              <button
                onClick={() =>
                  setShowQuickAdd(false)
                }
              >
                <X size={22} />
              </button>
            </div>

            <input
              type="text"
              value={taskInput}
              onChange={(e) =>
                setTaskInput(e.target.value)
              }
              placeholder="Enter task..."
              className="w-full p-4 rounded-2xl border outline-none text-black"
            />

            <button
              onClick={addQuickTask}
              className="w-full mt-4 bg-emerald-500 text-white py-4 rounded-2xl font-bold"
            >
              Add Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;