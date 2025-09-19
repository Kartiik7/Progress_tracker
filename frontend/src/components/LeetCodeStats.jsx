import React, { useState, useEffect } from 'react';
import { getLeetCodeStats } from '../api/leetcode';
import styles from './LeetCodeStats.module.css';

// Main component for the LeetCode Stats page
export default function LeetCodeStats() {
  const [username, setUsername] = useState('example');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading on initial mount
  const [error, setError] = useState('');

  // Fetches stats when the user clicks the button or on initial load
  const handleFetchStats = async (user) => {
    if (!user) {
      setError('Please enter a LeetCode username.');
      return;
    }
    setError('');
    setLoading(true);
    setStats(null);
    try {
      const data = await getLeetCodeStats(user);
      setStats(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An unknown error occurred.';
      setError(`Could not fetch stats for "${user}". ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-fetch stats for the default user on initial component load
  useEffect(() => {
    handleFetchStats(username);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFetchStats(username);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>LeetCode Stats</h1>
        <div className={styles.inputForm}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="faisalshohagprog"
            className={styles.input}
          />
          <button onClick={() => handleFetchStats(username)} disabled={loading} className={styles.button}>
            {loading ? '...' : 'Okay'}
          </button>
        </div>
      </div>

      {loading && <SkeletonLoader />}
      {error && <div className={styles.error}>{error}</div>}
      
      {stats && (
        <div className={styles.statsContainer}>
          <div className={styles.grid}>
            <StatCard label="Total Solved" value={`${stats.totalSolved} / ${stats.totalQuestions}`} percentage={(stats.totalSolved / stats.totalQuestions) * 100} />
            <StatCard label="Ranking" value={stats.ranking?.toLocaleString() || 'N/A'} />
            <StatCard label="Easy Solved" value={`${stats.easySolved} / ${stats.totalEasy}`} percentage={(stats.easySolved / stats.totalEasy) * 100} />
            <StatCard label="Medium Solved" value={`${stats.mediumSolved} / ${stats.totalMedium}`} percentage={(stats.mediumSolved / stats.totalMedium) * 100} />
            <StatCard label="Hard Solved" value={`${stats.hardSolved} / ${stats.totalHard}`} percentage={(stats.hardSolved / stats.totalHard) * 100} />
            <StatCard label="Contribution Points" value={stats.contributionPoint} />
          </div>
          {stats.submissionCalendar && <Heatmap calendarData={stats.submissionCalendar} />}
        </div>
      )}
    </div>
  );
}

// --- Helper Components ---

function StatCard({ label, value, percentage }) {
  // A simple card for displaying a single value like Ranking
  if (typeof percentage === 'undefined') {
    return (
        <div className={styles.statCard}>
            <div className={styles.difficultyInfo}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statValue}>{value}</span>
            </div>
        </div>
    );
  }

  // A card that includes a circular progress bar
  return (
    <div className={styles.statCard}>
      <div className={styles.difficultyInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.difficultyValue}>{value}</span>
      </div>
      <CircularProgress percentage={percentage} />
    </div>
  );
}

function CircularProgress({ percentage }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg className={styles.progressCircle} width="80" height="80" viewBox="0 0 80 80">
      <circle className={styles.progressCircleBg} strokeWidth="8" cx="40" cy="40" r={radius} />
      <circle
        className={styles.progressCircleFg}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        cx="40"
        cy="40"
        r={radius}
      />
    </svg>
  );
}

function Heatmap({ calendarData }) {
    // API returns a stringified JSON, so we must parse it.
    const submissions = typeof calendarData === 'string' ? JSON.parse(calendarData) : calendarData || {};
  
    // Create a map of date strings to submission counts for quick lookup
    const dates = {};
    for (const timestamp in submissions) {
      const date = new Date(parseInt(timestamp) * 1000);
      const dateString = date.toISOString().slice(0, 10);
      dates[dateString] = submissions[timestamp];
    }
  
    // Generate an array of all days in the last year
    const endDate = new Date();
    const days = [];
    for (let i = 0; i < 371; i++) { // 53 weeks * 7 days
        let day = new Date(endDate);
        day.setDate(day.getDate() - (370 - i));
        days.push(day);
    }
  
    // Determine the level of activity for coloring the cells
    const getLevel = (count) => {
        if (!count || count === 0) return 0;
        if (count > 10) return 4;
        if (count > 5) return 3;
        if (count > 2) return 2;
        return 1;
    }
  
    return (
      <div className={styles.heatmap}>
        <h2 className={styles.heatmapTitle}>Submission Heatmap</h2>
        <div className={styles.heatmapGrid}>
          {days.map((day, index) => {
            const dateString = day.toISOString().slice(0, 10);
            const count = dates[dateString] || 0;
            const level = getLevel(count);
            return (
              <div key={index} className={styles.heatmapCell} data-level={level}>
                <span className={styles.tooltip}>
                  {count} submissions on {day.toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
}

// Placeholder component for the loading state
function SkeletonLoader() {
  return (
    <div className={styles.statsContainer}>
       <div className={styles.grid}>
        {[...Array(6)].map((_, i) => <div key={i} className={`${styles.statCard} ${styles.skeleton}`} style={{height: '140px'}} />)}
      </div>
      <div className={`${styles.heatmap} ${styles.skeleton}`} style={{height: '220px'}} />
    </div>
  );
}

