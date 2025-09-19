import React, { useState, useEffect } from 'react';
import { getDashboardSummary } from '../api/dashboard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading Dashboard...</div>;
  }

  if (error) {
    return <div className={styles.loading}>{error}</div>;
  }
  
  const userEmail = summary.user?.email || 'User';
  const username = userEmail.split('@')[0];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.welcomeMessage}>Welcome back, {username}!</h1>
        <p className={styles.welcomeSub}>Here's a summary of your progress.</p>
      </header>
      
      <div className={styles.grid}>
        <TodayFocusCard tasks={summary.todaysTasks} />
        <UpcomingDeadlinesCard deadlines={summary.upcomingDeadlines} />
        <QuickStatsCard stats={summary.leetcodeStats} booksFinished={summary.finishedBooksCount} />
        <CurrentlyReadingCard book={summary.currentlyReading} />
      </div>
    </div>
  );
}

// --- Helper Components for Dashboard Cards ---

function TodayFocusCard({ tasks }) {
    return (
        <div className={`${styles.card} ${styles.focus}`}>
            <h2>Today's Focus</h2>
            {tasks && tasks.length > 0 ? (
                <ul>
                    {tasks.map(task => (
                        <li key={task._id} className={styles.listItem}>
                           <span className={styles.itemName}>{task.title}</span>
                           <span className={styles.itemDate}>Due Today</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.emptyState}>No tasks due today. Great job!</p>
            )}
        </div>
    );
}

function UpcomingDeadlinesCard({ deadlines }) {
    return (
        <div className={`${styles.card} ${styles.deadlines}`}>
            <h2>Upcoming Deadlines</h2>
            {deadlines && deadlines.length > 0 ? (
                <ul>
                    {deadlines.map(item => (
                        <li key={item._id} className={styles.listItem}>
                            <span className={styles.itemName}>{item.title}</span>
                            <span className={styles.itemDate}>
                                {new Date(item.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.emptyState}>No deadlines in the next 7 days.</p>
            )}
        </div>
    );
}

function QuickStatsCard({ stats, booksFinished }) {
    return (
        <div className={`${styles.card} ${styles.stats}`}>
            <h2>Quick Stats</h2>
            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats?.totalSolved || 'N/A'}</div>
                    <div className={styles.statLabel}>LeetCode Solved</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{booksFinished ?? 0}</div>
                    <div className={styles.statLabel}>Books Finished</div>
                </div>
            </div>
        </div>
    );
}

function CurrentlyReadingCard({ book }) {
    const progress = book && book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;

    return (
        <div className={`${styles.card} ${styles.reading}`}>
            <h2>Currently Reading</h2>
            {book ? (
                <div>
                    <h3 className={styles.itemName}>{book.title}</h3>
                    <div className={styles.bookProgress}>
                        <div className={styles.progress}>
                            <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className={styles.progressText}>
                            {book.currentPage} / {book.totalPages} pages ({progress}%)
                        </p>
                    </div>
                </div>
            ) : (
                <p className={styles.emptyState}>No book is being read right now.</p>
            )}
        </div>
    );
}

