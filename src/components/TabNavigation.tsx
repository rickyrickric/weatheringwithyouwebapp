import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TabNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', label: 'Home', icon: 'bi-house-fill' },
    { path: '/forecast', label: 'Forecast', icon: 'bi-cloud-sun-fill' },
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-graph-up' },
    { path: '/about', label: 'About', icon: 'bi-info-circle-fill' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          type="button"
          onClick={() => navigate(tab.path)}
          className={`nav-tab ${isActive(tab.path) ? 'active' : ''}`}
          aria-label={tab.label}
          aria-current={isActive(tab.path) ? 'page' : undefined}
        >
          <i className={`bi ${tab.icon}`} aria-hidden="true"></i>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;
