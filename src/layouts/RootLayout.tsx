import React from 'react';
import { Outlet } from 'react-router-dom';
import TabNavigation from '../components/TabNavigation';

const RootLayout: React.FC = () => {
  return (
    <div className="relative pb-32">
      <Outlet />
      <TabNavigation />
    </div>
  );
};

export default RootLayout;
