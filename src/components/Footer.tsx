import React, { useState } from 'react';
import SystemStatus from './SystemStatus';

interface FooterProps {
  lastUpdated?: Date;
}

const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  const [showStatus, setShowStatus] = useState(false);

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent backdrop-blur-sm border-t border-white/5 p-4 z-40">
        <div className="page-container flex items-center justify-between text-sm text-gray-400">
          <div>
            <p>Built with love, data, and a prayer for perfect weather ✨</p>
            <p className="text-xs text-gray-500 mt-1">
              Inspired by "Tenki no Ko" (Weathering with You) — where forecasting becomes connection
            </p>
          </div>
          <button
            onClick={() => setShowStatus(!showStatus)}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition text-gray-300 hover:text-white text-xs font-medium"
          >
            {showStatus ? 'Hide' : 'System'} Status
          </button>
        </div>
      </footer>

      {showStatus && <SystemStatus onClose={() => setShowStatus(false)} lastUpdated={lastUpdated} />}
    </>
  );
};

export default Footer;
