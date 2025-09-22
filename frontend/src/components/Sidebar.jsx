import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/app/dashboard', icon: '🏠', title: 'Dashboard' },
  { to: '/app/tasks', icon: '✅', title: 'To-Do List' },
  { to: '/app/projects', icon: '📂', title: 'Projects' },
  { to: '/app/calendar', icon: '📅', title: 'Calendar' },
  { to: '/app/leetcode', icon: '🔥', title: 'LeetCode' },
  { to: '/app/github', icon: '💻', title: 'GitHub' }, // New GitHub Link
  { to: '/app/bookshelf', icon: '📚', title: 'Bookshelf' },
];

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>PT</div>
      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            end={item.to === '/app/dashboard'}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.tooltip}>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.footer}>
        <NavLink
          to="/app/settings"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>⚙️</span>
          <span className={styles.tooltip}>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;

