import React, { useState, useEffect } from 'react';
import { getGithubStats } from '../api/github';
import { getProfile } from '../api/user'; // Corrected import name
import styles from './GitHubStats.module.css';
import { Link } from 'react-router-dom';

export default function GitHubStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        // First, get the user's profile to find their GitHub username
        const profile = await getProfile();
        const username = profile.settings?.githubUsername;

        if (!username) {
          setError("No GitHub username is set. Please add it in your settings.");
          setLoading(false);
          return;
        }

        // Then, fetch the stats for that username
        const data = await getGithubStats(username);
        setStats(data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
        setError(errorMessage);
        console.error("Failed to fetch GitHub stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <SkeletonLoader />;
    }

    if (error) {
      return (
        <div className={styles.emptyState}>
          <h2>Error Fetching Stats</h2>
          <p>{error}</p>
          {error.includes("No GitHub username is set") && (
            <Link to="/app/settings" className={styles.settingsLink}>
              Update your settings
            </Link>
          )}
        </div>
      );
    }
    
    if (!stats) {
      return <div className={styles.emptyState}>Could not load stats.</div>;
    }

    return <StatsDisplay stats={stats} />;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your GitHub Stats</h1>
      </header>
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
}

// --- UI Components ---

function StatsDisplay({ stats }) {
    const { user, topLanguages, topRepos } = stats;
    return (
        <>
            <div className={styles.profileHeader}>
                <img src={user.avatar_url} alt={`${user.login}'s avatar`} className={styles.avatar} />
                <div className={styles.profileInfo}>
                    <h2>{user.name}</h2>
                    <p>@{user.login}</p>
                    <div className={styles.profileStats}>
                        <span>{user.followers} Followers</span>
                        <span>·</span>
                        <span>{user.following} Following</span>
                         <span>·</span>
                        <span>{user.public_repos} Repositories</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3>Top Languages</h3>
                <div className={styles.languageGrid}>
                    {Object.entries(topLanguages).map(([lang, bytes]) => (
                        <div key={lang} className={styles.langItem}>{lang}</div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3>Top Repositories</h3>
                <div className={styles.repoGrid}>
                    {topRepos.map(repo => (
                        <a href={repo.html_url} key={repo.id} target="_blank" rel="noopener noreferrer" className={styles.repoCard}>
                            <h4>{repo.name}</h4>
                            <p>{repo.description}</p>
                            <div className={styles.repoStats}>
                                <span>⭐ {repo.stargazers_count}</span>
                                <span>{repo.language}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}


function SkeletonLoader() {
    return (
        <div>
            <div className={`${styles.profileHeader} ${styles.skeleton}`}></div>
            <div className={`${styles.section} ${styles.skeleton} ${styles.marginTop}`}></div>
            <div className={`${styles.section} ${styles.skeleton} ${styles.marginTop}`}></div>
        </div>
    );
}

