import React from 'react';
import { Outlet } from 'react-router-dom';
import TabNavigation from '../components/TabNavigation';

const RootLayout: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-x-hidden overflow-y-auto">
      <div className="relative min-h-full w-full">
        <Outlet />
        <TabNavigation />
      </div>
    </div>
  );
};

export default RootLayout;
