import { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import useAppStore from '../store/useAppStore'; // It imports from the file you just created
import './Layout.css';

function Layout() {
  const fetchData = useAppStore((state) => state.fetchData);

  // Fetch all data once when the main layout loads
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <nav className="navbar">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/medications">Medications</NavLink>
        <NavLink to="/activity">Activity</NavLink>
        <NavLink to="/log">Summary</NavLink>
        <NavLink to="/manual-entry">Manual Entry</NavLink>
        <NavLink to="/contacts">Contacts</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <main className="app-container">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;