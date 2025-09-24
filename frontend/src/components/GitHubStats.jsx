import React, { useState, useEffect, useCallback } from 'react';
import { getGithubStats } from '../api/github';
import { Link } from 'react-router-dom';
import styles from './GitHubStats.module.css';

export default function GitHubStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getGithubStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const renderContent = () => {
    if (loading) {
      return <div className={styles.loading}>Fetching your GitHub stats...</div>;
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h3>Error Fetching Stats</h3>
                <p>{error}</p>
                {error.includes("username is set") && (
                     <Link to="/app/settings" className={styles.settingsLink}>
                        Update your settings
                    </Link>
                )}
            </div>
        );
    }

    if (!stats) {
      return <div className={styles.empty}>No stats to display.</div>;
    }

    const { profile, topLanguages, topRepos } = stats;

    return (
      <div className={styles.statsGrid}>
        <div className={styles.profileCard}>
          <img src={profile.avatar_url} alt={`${profile.name}'s avatar`} className={styles.avatar} />
          <h2>{profile.name}</h2>
          <p className={styles.bio}>{profile.bio}</p>
          <div className={styles.profileStats}>
            <span><strong>{profile.followers}</strong> Followers</span>
            <span>·</span>
            <span><strong>{profile.following}</strong> Following</span>
            <span>·</span>
            <span><strong>{profile.public_repos}</strong> Repos</span>
          </div>
          <a href={profile.url} target="_blank" rel="noopener noreferrer" className={styles.profileLink}>
            View Profile on GitHub
          </a>
        </div>

        <div className={styles.reposCard}>
            <h3>Top Repositories</h3>
            <ul>
                {topRepos.map(repo => (
                    <li key={repo.name}>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>
                        <span>⭐ {repo.stars}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className={styles.langsCard}>
            <h3>Top Languages</h3>
            <ul>
                {topLanguages.map(lang => (
                    <li key={lang.name}>
                       <span className={styles.langName}>{lang.name}</span>
                       <span className={styles.langCount}>{lang.count} repos</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Your GitHub Stats</h1>
      </header>
      {renderContent()}
    </div>
  );
}

