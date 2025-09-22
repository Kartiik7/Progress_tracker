import React, { useState, useEffect } from 'react';
import { getLeetCodeStats } from '../api/leetcode';
import styles from './LeetCodeStats.module.css';
import { Link } from 'react-router-dom';

export default function LeetCodeStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getLeetCodeStats();
        setStats(data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
        setError(errorMessage);
        console.error("Failed to fetch LeetCode stats:", err);
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
          {error.includes("No LeetCode username is set") && (
            <Link to="/app/settings" className={styles.settingsLink}>
              Add your username in Settings
            </Link>
          )}
        </div>
      );
    }
    
    if (!stats) {
      return <div className={styles.emptyState}>No stats available.</div>;
    }

    return <StatsDisplay stats={stats} />;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your LeetCode Stats</h1>
      </header>
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
}


// --- UI Components ---

function StatsDisplay({ stats }) {
  const {
    totalSolved,
    totalQuestions,
    easySolved,
    totalEasy,
    mediumSolved,
    totalMedium,
    hardSolved,
    totalHard,
    ranking,
    contributionPoint,
    submissionCalendar
  } = stats;

  return (
    <>
      <div className={styles.statsGrid}>
        <StatCard title="Total Solved" value={`${totalSolved} / ${totalQuestions}`} />
        <StatCard title="Ranking" value={ranking?.toLocaleString()} />
        <StatCard title="Contribution Points" value={contributionPoint} />
        <DifficultyCard title="Easy" solved={easySolved} total={totalEasy} color="#4ade80" />
        <DifficultyCard title="Medium" solved={mediumSolved} total={totalMedium} color="#facc15" />
        <DifficultyCard title="Hard" solved={hardSolved} total={totalHard} color="#f87171" />
      </div>
      <Heatmap data={submissionCalendar} />
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statTitle}>{title}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function DifficultyCard({ title, solved, total, color }) {
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  return (
    <div className={styles.statCard}>
      <div className={styles.difficultyHeader}>
        <span className={styles.statTitle}>{title}</span>
        <span className={styles.statValueSmall}>{solved} / {total}</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percentage}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
}

// --- NEW AND IMPROVED HEATMAP COMPONENT ---

const getContributionLevel = (count, max) => {
    if (count === 0) return styles.level0;
    const percentage = count / max;
    if (percentage > 0.7) return styles.level4;
    if (percentage > 0.5) return styles.level3;
    if (percentage > 0.3) return styles.level2;
    return styles.level1;
};

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
}

function Heatmap({ data = {} }) {
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    
    const contributionsMap = new Map();
    for (const [timestamp, count] of Object.entries(data)) {
        const date = new Date(parseInt(timestamp, 10) * 1000);
        contributionsMap.set(formatDate(date), count);
    }
    const maxContribution = Math.max(...contributionsMap.values(), 1); // Avoid division by zero

    const weeks = [];
    let currentDate = new Date(startDate);
    // Align start date to the previous Sunday
    currentDate.setDate(currentDate.getDate() - startDate.getDay());

    for (let i = 0; i < 53; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
            const dateStr = formatDate(currentDate);
            const count = contributionsMap.get(dateStr) || 0;
            const isVisible = currentDate >= startDate && currentDate <= endDate;

            week.push({
                date: dateStr,
                count: count,
                levelClass: getContributionLevel(count, maxContribution),
                visible: isVisible,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
    }

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabelPositions = weeks.reduce((acc, week, i) => {
      const firstDayOfMonth = new Date(week[0].date);
      const month = firstDayOfMonth.getMonth();
      if (!acc.some(item => item.month === month)) {
        acc.push({ month, index: i });
      }
      return acc;
    }, []);

    return (
      <div className={styles.heatmapWrapper}>
        <h3 className={styles.heatmapTitle}>Submission Heatmap (Last Year)</h3>
        <div className={styles.heatmapContainer}>
          <div className={styles.heatmap}>
            <div className={styles.heatmapMonths}>
              {monthLabelPositions.map(({ month, index }) => (
                <div key={month} style={{ gridColumn: index + 1 }}>
                  {monthLabels[month]}
                </div>
              ))}
            </div>
            <div className={styles.heatmapBody}>
              <div className={styles.heatmapDays}>
                <span>Mon</span>
                <span></span>
                <span>Wed</span>
                <span></span>
                <span>Fri</span>
                <span></span>
                <span></span>
              </div>
              <div className={styles.heatmapGrid}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex}>
                    {week.map((day) => (
                      <div
                        key={day.date}
                        className={`${styles.heatmapCell} ${day.visible ? day.levelClass : ''}`}
                        title={day.visible ? `${day.count} submissions on ${day.date}` : ''}
                        style={{ visibility: day.visible ? 'visible' : 'hidden' }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}


function SkeletonLoader() {
  return (
    <div className={styles.statsGrid}>
      <div className={`${styles.statCard} ${styles.skeleton}`}></div>
      <div className={`${styles.statCard} ${styles.skeleton}`}></div>
      <div className={`${styles.statCard} ${styles.skeleton}`}></div>
      <div className={`${styles.statCard} ${styles.skeleton}`}></div>
      <div className={`${styles.statCard} ${styles.skeleton}`}></div>
      <div className={`${styles.statCard} ${styles.skeleton}`}></div>
    </div>
  );
}

