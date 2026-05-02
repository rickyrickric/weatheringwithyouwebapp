import React, { type ReactNode, type CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div
      className={`glass-card p-6 hover:bg-white/10 hover:border-white/20 ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
      onClick={onClick}
      style={{ willChange: 'transform', backfaceVisibility: 'hidden', ...style }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
