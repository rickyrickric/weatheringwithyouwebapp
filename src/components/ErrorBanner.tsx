import React from 'react';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'toast';
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  message = "Unable to fetch live weather data. Displaying cached information.", 
  onRetry,
  onDismiss,
  variant = 'inline',
}) => {
  const isToast = variant === 'toast';

  return (
    <div
      className={`bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl backdrop-blur-md ${
        isToast
          ? 'fixed top-4 right-4 z-50 w-[92vw] max-w-sm shadow-lg'
          : 'flex flex-col sm:flex-row items-center justify-between gap-4 mb-6'
      }`}
      role="status"
    >
      <div className={`flex items-start gap-3 ${isToast ? 'pr-8' : ''}`}>
        <span className="text-xl">⚠️</span>
        <p className="text-sm">{message}</p>
      </div>
      <div className={`flex items-center gap-2 ${isToast ? 'mt-3' : ''}`}>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 rounded-lg text-sm font-semibold transition-colors"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-amber-100/80 hover:text-amber-100 text-xs font-semibold transition-colors"
            aria-label="Dismiss alert"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
