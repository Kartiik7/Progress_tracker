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
      <Heatmap data={submissionCalendar || {}} />
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

// --- FINAL, FIXED HEATMAP COMPONENT ---
function Heatmap({ data = {} }) {
    const contributionsMap = new Map(Object.entries(data).map(([ts, count]) => {
        const date = new Date(parseInt(ts, 10) * 1000).toISOString().split('T')[0];
        return [date, count];
    }));

    const maxContribution = Math.max(...contributionsMap.values(), 1);

    const getLevelClass = (count) => {
        if (count === 0) return styles.level0;
        const p = count / maxContribution;
        if (p > 0.7) return styles.level4;
        if (p > 0.5) return styles.level3;
        if (p > 0.3) return styles.level2;
        return styles.level1;
    };

    const today = new Date();
    const endDate = today;
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    startDate.setDate(today.getDate() + 1);

    const yearData = [];
    let currentDate = new Date(startDate);

    // Push days with correct alignment
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = contributionsMap.get(dateStr) || 0;

        yearData.push({
            date: dateStr,
            count,
            levelClass: getLevelClass(count),
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Split yearData into months
    const months = [];
    let monthStart = 0;
    for (let i = 0; i < yearData.length; i++) {
        const day = yearData[i];
        const dayMonth = new Date(day.date).getMonth();
        const nextDayMonth = yearData[i + 1]?.date ? new Date(yearData[i + 1].date).getMonth() : dayMonth;
        if (dayMonth !== nextDayMonth || i === yearData.length - 1) {
            months.push(yearData.slice(monthStart, i + 1));
            monthStart = i + 1;
        }
    }

    const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    return (
        <div className={styles.heatmapWrapper}>
            <h3 className={styles.heatmapTitle}>Submission Heatmap (Last Year)</h3>
            <div className={styles.heatmapContainer}>
                {months.map((monthData, idx) => {
                    const monthName = monthLabels[new Date(monthData[0].date).getMonth()];
                    const emptyCells = new Array(new Date(monthData[0].date).getDay()).fill(null);

                    return (
                        <div key={idx} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{monthName}</div>
                            <div className={styles.heatmapDays}>
                                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                            </div>
                            <div className={styles.heatmapCells}>
                                {emptyCells.map((_, i) => (
                                    <div key={`empty-${i}`} className={`${styles.heatmapCell} ${styles.level0}`} />
                                ))}
                                {monthData.map(day => (
                                    <div
                                        key={day.date}
                                        className={`${styles.heatmapCell} ${day.levelClass}`}
                                        title={`${day.count} submissions on ${day.date}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
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