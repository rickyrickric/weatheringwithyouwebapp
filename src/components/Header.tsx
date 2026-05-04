import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="py-6 px-4 space-y-2">
      <h2 className="text-3xl font-bold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      <div className="h-0.5 w-16 bg-[#D4622A]/70 rounded-full" />
    </div>
  );
};

export default Header;
