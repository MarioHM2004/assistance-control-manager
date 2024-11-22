import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { SideBar } from './SideBar';

export const Layout: React.FC = () => {
  return (
    <div>
      <NavBar />
      <SideBar />
      <div>
        <Outlet />
      </div>
    </div>
  );
};
