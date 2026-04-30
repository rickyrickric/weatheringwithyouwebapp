import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);

  const handlePrayer = () => {
    setIsClearing(true);
    // Cloud clearing animation duration
    setTimeout(() => {
      navigate('/forecast');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background with Rain Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900/40 to-slate-800 z-0">
        {/* Rain streaks effect */}
        <div className="absolute inset-0 opacity-60">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-16 bg-gradient-to-b from-transparent via-white to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `fall ${2 + Math.random() * 2}s linear infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Animated Clouds - will clear on button click */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-slate-700/50 via-slate-600/30 to-transparent transition-all duration-1000 ${
            isClearing ? 'opacity-0 scale-125' : 'opacity-100 scale-100'
          }`}
          style={{
            filter: isClearing ? 'blur(10px)' : 'blur(0)',
          }}
        />

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <div className="text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-400 animate-pulse">
              Weathering with You
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-orange-400 to-cyan-400 mx-auto rounded-full" />
          </div>

          {/* Hero Section */}
          <div className="space-y-6 py-8">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white">
                A Prayer for the
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300">
                Palm City
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-xl mx-auto">
              Harnessing 6 months of climate memory to predict Tagum's sunshine windows with atmospheric intelligence.
            </p>

            {/* Description */}
            <p className="text-sm md:text-base text-gray-400 italic max-w-lg mx-auto">
              Inspired by the timeless beauty of "Tenki no Ko" — where weather forecasting becomes an act of connection. 
              Send a sunshine prayer and discover the perfect moments ahead.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <button
              onClick={handlePrayer}
              disabled={isClearing}
              className={`
                group relative px-8 md:px-12 py-4 md:py-5 text-lg md:text-xl font-semibold
                rounded-full overflow-hidden transition-all duration-500
                ${isClearing 
                  ? 'opacity-50 cursor-wait' 
                  : 'hover:scale-105 active:scale-95'
                }
              `}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 opacity-90 group-hover:opacity-100 transition-opacity" />
              
              {/* Animated glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-pulse" />
              
              {/* Text */}
              <span className="relative text-white flex items-center justify-center gap-2">
                {isClearing ? (
                  <>
                    <span className="inline-block animate-spin">⛅</span>
                    Clearing the clouds...
                  </>
                ) : (
                  <>
                    Send a Sunshine Prayer
                    <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Secondary CTA */}
          <div className="text-sm text-gray-500 pt-4">
            Or scroll to explore the forecast →
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="text-3xl">↓</div>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
