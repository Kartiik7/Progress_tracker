import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

// Reusable NavItem component for sidebar links
function NavItem({ to, title, children }) {
  return (
    <NavLink 
      to={to} 
      end={to === "/"}
      className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      title={title}
    >
      {children}
      <span className={styles.tooltip}>{title}</span>
    </NavLink>
  );
}

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>PT</div>
      
      <nav className={styles.nav}>
        <NavItem to="/" title="Dashboard">🏠</NavItem>
        <NavItem to="/tasks" title="To-Do List">✅</NavItem>
        <NavItem to="/calendar" title="Calendar">📅</NavItem>
        <NavItem to="/projects" title="Projects">🗂️</NavItem>
        <NavItem to="/leetcode" title="LeetCode Stats">💻</NavItem>
        <NavItem to="/bookshelf" title="Bookshelf">📚</NavItem>
      </nav>
      
      <div className={styles.footer}>
        <NavItem to="/settings" title="Settings">⚙️</NavItem>
      </div>
    </aside>
  );
}

export default Sidebar;

