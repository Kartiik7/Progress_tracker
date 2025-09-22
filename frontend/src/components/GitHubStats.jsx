import React, { useState, useEffect } from 'react';
import { getGithubStats } from '../api/github';
import { getUserProfile } from '../api/user';
import styles from './GitHubStats.module.css';

// Main component for the GitHub Stats page
export default function GitHubStats() {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the saved GitHub username from user settings on component mount
  useEffect(() => {
    const fetchSavedUsername = async () => {
      try {
        const profile = await getUserProfile();
        if (profile.settings && profile.settings.githubUsername) {
          setUsername(profile.settings.githubUsername);
          handleFetchStats(profile.settings.githubUsername);
        }
      } catch (err) {
        console.error("Could not fetch saved GitHub username", err);
      }
    };
    fetchSavedUsername();
  }, []);

  const handleFetchStats = async (userToFetch) => {
    if (!userToFetch) {
      setError('Please enter a GitHub username.');
      return;
    }
    setLoading(true);
    setError('');
    setStats(null);
    try {
      const data = await getGithubStats(userToFetch);
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFetchStats(username);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>GitHub Profile Stats</h1>
        <p>Enter a GitHub username to see their stats.</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g., torvalds"
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Fetching...' : 'Get Stats'}
        </button>
      </form>

      {loading && <SkeletonLoader />}
      {error && <p className={styles.error}>{error}</p>}
      {stats && <StatsDisplay stats={stats} />}
    </div>
  );
}

// --- Helper Components ---

function StatsDisplay({ stats }) {
  return (
    <div className={styles.statsContainer}>
      <div className={styles.profileCard}>
        <img src={stats.avatarUrl} alt={`${stats.username}'s avatar`} className={styles.avatar} />
        <div className={styles.profileInfo}>
          <h2>{stats.name || stats.username}</h2>
          <a href={`https://github.com/${stats.username}`} target="_blank" rel="noopener noreferrer">
            @{stats.username}
          </a>
          <div className={styles.profileStats}>
            <span><strong>{stats.followers}</strong> Followers</span>
            <span>·</span>
            <span><strong>{stats.following}</strong> Following</span>
            <span>·</span>
            <span><strong>{stats.publicRepos}</strong> Repos</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Top Languages</h3>
          <ul className={styles.languageList}>
            {stats.topLanguages.map(lang => (
              <li key={lang.name}>
                <span>{lang.name}</span>
                <span>{lang.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${styles.card} ${styles.repoCard}`}>
          <h3>Top Repositories</h3>
          <ul className={styles.repoList}>
            {stats.topRepos.map(repo => (
              <li key={repo.name}>
                <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>
                <div className={styles.repoStats}>
                  <span>{repo.language}</span>
                  <span>⭐ {repo.stars}</span>
                  <span> forks {repo.forks}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SkeletonLoader() {
    return (
        <div className={styles.statsContainer}>
            <div className={styles.profileCard}>
                <div className={`${styles.avatar} ${styles.skeleton}`}></div>
                <div className={styles.profileInfo}>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '150px', height: '28px' }}></div>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '120px' }}></div>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '250px', marginTop: '10px' }}></div>
                </div>
            </div>
             <div className={styles.grid}>
                <div className={`${styles.card} ${styles.skeleton}`} style={{ height: '200px' }}></div>
                <div className={`${styles.card} ${styles.skeleton}`} style={{ height: '200px' }}></div>
            </div>
        </div>
    )
}
