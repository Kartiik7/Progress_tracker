import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import * as userApi from "../api/user";
import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
  const { logout } = useAuth();
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    userApi
      .getUserProfile()
      .then((user) => {
        setLeetcodeUsername(user.settings?.leetcodeUsername || "");
      })
      .catch((err) => console.error("Failed to fetch user profile", err));
  }, []);

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateUserSettings({ leetcodeUsername });
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save settings.",
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    try {
      const res = await userApi.changePassword(passwordData);
      setMessage({ type: "success", text: res.message });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password.",
      });
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    // A simple confirmation for logout
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div className={styles.page}>
      <h1>Settings</h1>

      {message.text && (
        <div
          className={message.type === "success" ? styles.success : styles.error}
        >
          {message.text}
        </div>
      )}

      <div className={styles.card}>
        <h2>General Settings</h2>
        <form onSubmit={handleSettingsSave} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="leetcodeUsername">LeetCode Username</label>
            <input
              id="leetcodeUsername"
              type="text"
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="Enter your LeetCode username"
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>
            Save Settings
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordChange} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordInputChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>
            Change Password
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <h2>Account</h2>
        <button
          onClick={handleLogout}
          className={`${styles.button} ${styles.dangerButton}`}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
