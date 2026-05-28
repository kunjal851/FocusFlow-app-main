/**
 * Login Form Component
 *
 * Handles user authentication with email/password.
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  isDark: boolean;
  onToggleMode: () => void;
}

export function LoginForm({ isDark, onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-50 text-red-600'}`}>
          {error}
        </div>
      )}

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`w-full border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
              : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
          }`}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={`w-full border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
              : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
          }`}
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className={`text-sm ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
        >
          Don't have an account? Sign up
        </button>
      </div>
    </form>
  );
}

/**
 * Signup Form Component
 *
 * Handles user registration with email/password.
 */

export function SignupForm({ isDark, onToggleMode }: LoginFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`text-center p-6 rounded-xl ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
        <p className="text-lg font-semibold mb-2">Check your email!</p>
        <p className="text-sm">We've sent you a confirmation link to {email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-50 text-red-600'}`}>
          {error}
        </div>
      )}

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
              : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
          }`}
          placeholder="Your name"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`w-full border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
              : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
          }`}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className={`w-full border-2 rounded-xl px-4 py-3 outline-none transition-all duration-300 ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
              : 'bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
          }`}
          placeholder="Minimum 6 characters"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className={`text-sm ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
}
