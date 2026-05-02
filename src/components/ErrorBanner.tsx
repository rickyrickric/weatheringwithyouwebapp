import React from 'react';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  message = "Unable to fetch live weather data. Displaying cached information.", 
  onRetry 
}) => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <p className="text-sm">{message}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg text-sm font-semibold transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
