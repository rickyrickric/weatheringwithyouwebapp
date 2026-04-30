import React, { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`glass-card p-6 cursor-pointer hover:bg-white/10 hover:border-white/20 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
