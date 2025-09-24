import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';
import * as userApi from '../api/user';
import styles from './SettingsPage.module.css';
import { useNavigate } from 'react-router-dom';

// Reusable Accordion Section Component
function SettingsSection({ title, children, isActive, onClick }) {
  return (
    <div className={`${styles.section} ${isActive ? styles.active : ''}`}>
      <button className={styles.sectionHeader} onClick={onClick}>
        <span>{title}</span>
        <span className={styles.chevron}>›</span>
      </button>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
}

// Main Settings Page Component
export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState(null);
  const [currentUser, setCurrentUser] = useState({ email: '' });
  const [profile, setProfile] = useState({ leetcodeUsername: '', githubUsername: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [actionToVerify, setActionToVerify] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile();
        setCurrentUser({ email: data.email });
        setProfile({
          leetcodeUsername: data.settings?.leetcodeUsername || '',
          githubUsername: data.settings?.githubUsername || ''
        });
      } catch (err) {
        setError("Failed to fetch profile data.");
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const handleSectionClick = (section) => {
    setActiveSection(activeSection === section ? null : section);
    clearMessages();
  };

  const handleUpdateProfile = async () => {
    clearMessages();
    const action = async () => {
        try {
            await userApi.updateProfile(profile);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };
    setActionToVerify(() => action);
    setShowVerifyModal(true);
  };

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!newEmail) return setError("Please enter a new email address.");

    const action = async (password) => {
        try {
            const res = await userApi.requestEmailChange(newEmail, password);
            setMessage(res.message);
            setNewEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request email change.');
        }
    };
    setActionToVerify(() => () => action(verifyPassword));
    setShowVerifyModal(true);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (passwords.new !== passwords.confirm) return setError("New passwords do not match.");
    
    try {
        await userApi.changePassword(passwords.current, passwords.new);
        setMessage('Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleVerify = async () => {
    if (!actionToVerify) return;
    try {
        await userApi.verifyPassword(verifyPassword);
        actionToVerify();
        setShowVerifyModal(false);
        setVerifyPassword('');
        setActionToVerify(null);
    } catch (err) {
        alert("Incorrect password. Please try again.");
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>
      
      {message && <div className={styles.message}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.settingsList}>
        <SettingsSection title="Account" isActive={activeSection === 'account'} onClick={() => handleSectionClick('account')}>
          <div className={styles.field}>
            <label>Current Email</label>
            <input type="email" value={currentUser.email} disabled />
          </div>
          <form onSubmit={handleRequestEmailChange} className={styles.form}>
            <div className={styles.field}>
              <label>New Email</label>
              <input type="email" placeholder="Enter new email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <button type="submit" className={styles.button}>Request Email Change</button>
          </form>
        </SettingsSection>
        
        <SettingsSection title="Change Password" isActive={activeSection === 'password'} onClick={() => handleSectionClick('password')}>
          <form onSubmit={handleUpdatePassword} className={styles.form}>
            <div className={styles.field}><label>Current Password</label><input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} required /></div>
            <div className={styles.field}><label>New Password</label><input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} required /></div>
            <div className={styles.field}><label>Confirm New Password</label><input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} required /></div>
            <button type="submit" className={styles.button}>Update Password</button>
          </form>
        </SettingsSection>
        
        <SettingsSection title="Linked Accounts" isActive={activeSection === 'linked'} onClick={() => handleSectionClick('linked')}>
          <div className={styles.form}>
            <div className={styles.field}><label>LeetCode Username</label><input type="text" name="leetcodeUsername" value={profile.leetcodeUsername} onChange={(e) => setProfile({...profile, leetcodeUsername: e.target.value})} /></div>
            <div className={styles.field}><label>GitHub Username</label><input type="text" name="githubUsername" value={profile.githubUsername} onChange={(e) => setProfile({...profile, githubUsername: e.target.value})} /></div>
            <button onClick={handleUpdateProfile} className={styles.button}>Save Linked Accounts</button>
          </div>
        </SettingsSection>
        
        <SettingsSection title="Appearance" isActive={activeSection === 'appearance'} onClick={() => handleSectionClick('appearance')}>
           <p className={styles.description}>Choose your preferred theme for the application.</p>
           <div className={styles.themeSelector}>
              <button onClick={() => toggleTheme('light')} className={`${styles.themeButton} ${theme === 'light' ? styles.activeTheme : ''}`}>Light</button>
              <button onClick={() => toggleTheme('dark')} className={`${styles.themeButton} ${theme === 'dark' ? styles.activeTheme : ''}`}>Dark</button>
           </div>
        </SettingsSection>

        <SettingsSection title="Danger Zone" isActive={activeSection === 'danger'} onClick={() => handleSectionClick('danger')}>
            <button onClick={handleLogout} className={`${styles.button} ${styles.danger}`}>Logout</button>
        </SettingsSection>
      </div>

      {showVerifyModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Verify Your Identity</h3>
            <p>Please enter your current password to confirm this change.</p>
            <div className={styles.field}>
              <label>Current Password</label>
              <input type="password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleVerify()} />
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowVerifyModal(false)} className={`${styles.button} ${styles.buttonSecondary}`}>Cancel</button>
              <button onClick={handleVerify} className={styles.button}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}