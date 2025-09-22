import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import styles from './Auth.module.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      navigate('/app'); // Redirect to the main app dashboard
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>PT</div>
          <div>
            <div className={styles.title}>Welcome back</div>
            <div className={styles.subtitle}>Log in to your dashboard</div>
          </div>
        </div>
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actions}>
            <button disabled={loading} className={styles.buttonPrimary} type="submit">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </div>
        </form>
        <div className={styles.mutedRow}>
          <span>Don’t have an account?</span>
          <Link className={styles.link} to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}

