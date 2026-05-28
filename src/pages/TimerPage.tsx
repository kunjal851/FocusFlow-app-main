import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Book, Dumbbell, Brain, Sparkles } from 'lucide-react';

export default function TimerPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('Deep Focus');
  const [customMinutes, setCustomMinutes] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme !== 'light');
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
  };

  const applyCustomTime = () => {
    const custom = parseInt(customMinutes);
    if (custom > 0) {
      setMinutes(custom);
      setSeconds(0);
      setCustomMinutes('');
    }
  };

  const activities = [
    { emoji: Timer, label: 'Deep Focus', time: 25, color: 'emerald' },
    { emoji: Coffee, label: 'Break', time: 5, color: 'amber' },
    { emoji: Book, label: 'Reading', time: 30, color: 'teal' },
    { emoji: Dumbbell, label: 'Workout', time: 45, color: 'orange' },
    { emoji: Brain, label: 'Meditation', time: 10, color: 'cyan' },
  ];

  const changeMode = (activity: typeof activities[0]) => {
    setMode(activity.label);
    setMinutes(activity.time);
    setSeconds(0);
  };

  const totalSeconds = minutes * 60 + seconds;
  const maxSeconds = (activities.find(a => a.label === mode)?.time || 25) * 60;
  const progress = ((maxSeconds - totalSeconds) / maxSeconds) * 100;

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Timer display */}
      <div className={`relative backdrop-blur-2xl border rounded-[2rem] p-12 transition-all duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 shadow-2xl shadow-emerald-500/20'
          : 'bg-gradient-to-br from-white/80 to-white/40 border-white/60 shadow-2xl shadow-slate-900/10'
      }`}>
        {/* Animated background rings */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
          <div
            className={`absolute inset-8 border-2 rounded-full transition-all duration-1000 ${
              isRunning ? 'animate-spin-slow' : ''
            } ${isDark ? 'border-emerald-500/20' : 'border-emerald-500/10'}`}
          />
          <div
            className={`absolute inset-16 border-2 rounded-full transition-all duration-1000 ${
              isRunning ? 'animate-spin-reverse' : ''
            } ${isDark ? 'border-teal-500/10' : 'border-teal-500/5'}`}
          />
        </div>

        <div className="relative flex flex-col items-center">
          {/* Timer circle */}
          <div className="relative w-80 h-80 mb-10">
            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="150"
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                strokeWidth="8"
              />
              <circle
                cx="160"
                cy="160"
                r="150"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 150 * (progress / 100)} ${2 * Math.PI * 150}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing center */}
            <div className={`absolute inset-12 rounded-full ${isDark ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' : 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5'} backdrop-blur-xl`} />

            {/* Timer content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-7xl font-bold tabular-nums mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Sparkles size={16} className={isRunning ? 'animate-pulse' : ''} />
                <p className="text-sm font-semibold tracking-widest uppercase">{mode}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={startTimer}
              disabled={isRunning}
              className={`group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all duration-300 ${
                isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105 active:scale-95'
              }`}
            >
              <div className="flex items-center gap-3">
                <Play size={22} />
                <span>Start</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={pauseTimer}
              className={`px-8 py-4 border-2 rounded-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                  : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Pause size={22} />
                <span>Pause</span>
              </div>
            </button>

            <button
              onClick={resetTimer}
              disabled={!isRunning && minutes === 25 && seconds === 0}
              className={`p-4 border-2 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                  : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white/80 hover:border-slate-300'
              } disabled:opacity-30 disabled:hover:scale-100`}
            >
              <RotateCcw size={22} />
            </button>
          </div>

          {/* Quick time input */}
          <div className={`w-full max-w-md backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white/50 border-white/30'
          }`}>
            <input
              type="text"
              placeholder="Current focus task..."
              className={`w-full border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 mb-4 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
                  : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
              }`}
            />
            <div className="flex gap-3">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyCustomTime()}
                placeholder="Custom minutes"
                min="1"
                max="120"
                className={`flex-1 border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                }`}
              />
              <button
                onClick={applyCustomTime}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity selector */}
      <div className={`backdrop-blur-2xl border rounded-3xl p-8 transition-all duration-300 ${
        isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-white/60 border-white/40'
      }`}>
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Select Activity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {activities.map((activity) => {
            const isActive = mode === activity.label;
            const Icon = activity.emoji;
            return (
              <button
                key={activity.label}
                onClick={() => changeMode(activity)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isActive
                    ? activity.color === 'emerald' ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/30' :
                      activity.color === 'amber' ? 'border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/30' :
                      activity.color === 'teal' ? 'border-teal-500 bg-teal-500/20 shadow-lg shadow-teal-500/30' :
                      activity.color === 'orange' ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/30' :
                      'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/30'
                    : isDark
                      ? 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-white/40'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Icon size={32} className={`transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-700'
                  }`} />
                  <span className={`text-sm font-semibold ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {activity.label}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {activity.time}m
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
