import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import { signup as signupApi } from '../api/auth';
import { useAuth } from '../context/useAuth';

export default function Signup() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signupApi(email, password);
      // Automatically log the user in after successful signup
      const ok = await login(email, password);
      if (ok) {
        navigate('/app'); // Redirect to the main app dashboard
      } else {
        setMessage('Account created! Please log in.');
        navigate('/login');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Sign up failed');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>PT</div>
          <div>
            <div className={styles.title}>Create your account</div>
            <div className={styles.subtitle}>Join and start tracking progress</div>
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
              placeholder="Create a password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              className={styles.input}
              placeholder="Re-enter your password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}
          <div className={styles.actions}>
            <button disabled={loading} className={styles.buttonPrimary} type="submit">
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
        <div className={styles.mutedRow}>
          <span>Already have an account?</span>
          <Link className={styles.link} to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
