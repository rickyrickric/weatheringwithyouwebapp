import React from 'react';
import { Outlet } from 'react-router-dom';
import TabNavigation from '../components/TabNavigation';

const RootLayout: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="relative h-full w-full overflow-hidden">
        <Outlet />
        <TabNavigation />
      </div>
    </div>
  );
};

export default RootLayout;
