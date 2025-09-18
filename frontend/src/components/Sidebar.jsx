import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css'; // Import the new CSS module

function Sidebar() {
  // The logic for applying active class is now simpler
  const getLinkClass = ({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span>PT</span>
      </div>
      <div className={styles.linkGroup}>
        <NavLink to="/" end className={getLinkClass} title="Home">🏠</NavLink>
        <NavLink to="/calendar" className={getLinkClass} title="Calendar">📅</NavLink>
        <NavLink to="/projects" className={getLinkClass} title="Projects">📋</NavLink>
        <NavLink to="/coding" className={getLinkClass} title="Coding Stats">💻</NavLink>
        <NavLink to="/leetcode" className={getLinkClass} title="LeetCode Stats">🔥</NavLink>
        <NavLink to="/book" className={getLinkClass} title="Book Goal">📚</NavLink>
      </div>
      <div className={styles.footer}>
        <NavLink to="/settings" className={getLinkClass} title="Settings">⚙️</NavLink>
      </div>
    </nav>
  );
}

export default Sidebar;

