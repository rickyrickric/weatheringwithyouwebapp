import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TabNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/forecast', label: 'Forecast', icon: '⛅' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent backdrop-blur-[20px] border-t border-white/10">
      <div className="page-container py-4">
        <div className="flex justify-center items-center gap-2 md:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`
                flex items-center gap-2 px-4 md:px-6 py-3 rounded-full font-medium
                transition-all duration-300 text-sm md:text-base
                ${
                  isActive(tab.path)
                    ? 'bg-[#D4622A]/80 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;
