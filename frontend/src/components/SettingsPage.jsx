import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';
import * as userApi from '../api/user';
import styles from './SettingsPage.module.css';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({ leetcodeUsername: '', githubUsername: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [onVerifySuccess, setOnVerifySuccess] = useState(null);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile();
        setProfile({
          leetcodeUsername: data.settings?.leetcodeUsername || '',
          githubUsername: data.settings?.githubUsername || ''
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setMessage('');
    setError('');
    const action = async () => {
        try {
            await userApi.updateProfile(profile);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };
    setOnVerifySuccess(() => action);
    setShowVerifyModal(true);
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (passwords.new !== passwords.confirm) {
        setError("New passwords do not match.");
        return;
    }
    try {
        await userApi.changePassword(passwords.current, passwords.new);
        setMessage('Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleVerify = async () => {
    try {
        await userApi.verifyPassword(verifyPassword);
        setShowVerifyModal(false);
        setVerifyPassword('');
        if (onVerifySuccess) {
            onVerifySuccess();
        }
    } catch (err) {
        alert("Incorrect password. Please try again."); // Using alert for simplicity
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      {/* Linked Accounts Card */}
      <div className={styles.card}>
        <h2>Linked Accounts</h2>
        <div className={styles.field}>
          <label>LeetCode Username</label>
          <input 
            type="text" 
            name="leetcodeUsername" 
            value={profile.leetcodeUsername} 
            onChange={handleProfileChange}
            placeholder="e.g., your_leetcode_id"
          />
        </div>
        <div className={styles.field}>
          <label>GitHub Username</label>
          <input 
            type="text" 
            name="githubUsername" 
            value={profile.githubUsername} 
            onChange={handleProfileChange}
            placeholder="e.g., your_github_id"
          />
        </div>
        <button onClick={handleUpdateProfile} className={styles.button}>Save Linked Accounts</button>
      </div>
      
      {/* Appearance Card */}
      <div className={styles.card}>
          <h2>Appearance</h2>
          <p>Choose your preferred theme for the application.</p>
          <div className={styles.themeSelector}>
              <button 
                onClick={() => toggleTheme('light')} 
                className={`${styles.themeButton} ${theme === 'light' ? styles.activeTheme : ''}`}
              >
                Light
              </button>
              <button 
                onClick={() => toggleTheme('dark')} 
                className={`${styles.themeButton} ${theme === 'dark' ? styles.activeTheme : ''}`}
              >
                Dark
              </button>
          </div>
      </div>

      {/* Change Password Card */}
      <div className={styles.card}>
        <h2>Change Password</h2>
        <form onSubmit={handleUpdatePassword}>
          <div className={styles.field}>
            <label>Current Password</label>
            <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} required />
          </div>
          <div className={styles.field}>
            <label>New Password</label>
            <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} required />
          </div>
          <div className={styles.field}>
            <label>Confirm New Password</label>
            <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} required />
          </div>
          <button type="submit" className={styles.button}>Update Password</button>
        </form>
      </div>

      {/* General Actions */}
      <div className={styles.card}>
        <button onClick={handleLogout} className={`${styles.button} ${styles.danger}`}>Logout</button>
      </div>

      {message && <div className={styles.message}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      {/* Password Verification Modal */}
      {showVerifyModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Verify Your Identity</h3>
            <p>Please enter your current password to confirm this change.</p>
            <div className={styles.field}>
              <label>Current Password</label>
              <input 
                type="password" 
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowVerifyModal(false)} className={styles.buttonSecondary}>Cancel</button>
              <button onClick={handleVerify} className={styles.button}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

