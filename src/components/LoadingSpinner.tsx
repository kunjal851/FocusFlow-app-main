/**
 * Loading Spinner Component
 *
 * Displays a loading spinner with optional message.
 */

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  isDark?: boolean;
}

export function LoadingSpinner({ size = 'md', message, isDark = true }: LoadingSpinnerProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2
        size={sizes[size]}
        className={`animate-spin ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
      />
      {message && (
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Loading Skeleton Component
 *
 * Displays a skeleton placeholder while content is loading.
 */

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-700/30 rounded-xl ${className}`} />
  );
}

/**
 * Error Display Component
 *
 * Displays an error message with retry option.
 */

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  isDark?: boolean;
}

export function ErrorDisplay({ message, onRetry, isDark = true }: ErrorDisplayProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-8 p-6 rounded-xl ${
      isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'
    }`}>
      <AlertCircle size={40} className={isDark ? 'text-red-400' : 'text-red-500'} />
      <p className="text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
          }`}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}
