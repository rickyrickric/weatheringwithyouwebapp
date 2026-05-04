import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const baseClass = "bg-slate-700/50 animate-pulse";
  
  let variantClass = '';
  if (variant === 'circular') {
    variantClass = 'rounded-full';
  } else if (variant === 'text') {
    variantClass = 'rounded-md h-4';
  } else {
    variantClass = 'rounded-xl';
  }

  return (
    <div className={`${baseClass} ${variantClass} ${className}`} />
  );
};

export const KPISkeleton = () => (
  <div className="grid gap-3 grid-auto-fit">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="w-5 h-5" />
          <Skeleton variant="text" className="w-16" />
        </div>
        <Skeleton variant="text" className="w-12 h-6" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-4 h-[240px] flex flex-col justify-end gap-2">
    <div className="flex justify-between mb-auto">
      <Skeleton variant="text" className="w-32" />
      <Skeleton variant="text" className="w-16" />
    </div>
    <Skeleton className="w-full h-[140px]" />
    <div className="flex justify-between">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} variant="text" className="w-8" />
      ))}
    </div>
  </div>
);

export default Skeleton;
