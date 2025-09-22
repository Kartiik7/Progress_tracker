import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { token } = useAuth();

  // If the user is already logged in, redirect them to the dashboard
  if (token) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>PT</div>
        <nav className={styles.nav}>
          <Link to="/login" className={styles.navLink}>Login</Link>
          <Link to="/signup" className={`${styles.navLink} ${styles.navButton}`}>Sign Up</Link>
        </nav>
      </header>
      <main className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Organize Your Ambition.
        </h1>
        <p className={styles.heroSubtitle}>
          The all-in-one platform for students to track tasks, projects, reading goals, and coding progress. Stop juggling apps and start making progress.
        </p>
        <Link to="/signup" className={styles.heroButton}>
          Get Started for Free
        </Link>
      </main>
    </div>
  );
}
