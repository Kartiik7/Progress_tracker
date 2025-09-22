import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../api/dashboard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getDashboardData();
                setDashboardData(data);
                setError(null);
            } catch (err) {
                setError('Failed to load dashboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className={styles.page}><p className={styles.loading}>Loading dashboard...</p></div>;
    }

    if (error) {
        return <div className={styles.page}><p className={styles.error}>{error}</p></div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Welcome back, {dashboardData?.user.email.split('@')[0]}!</h1>
                <p>Here's a summary of your progress.</p>
            </header>

            <div className={styles.grid}>
                <div className={`${styles.card} ${styles.focusCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>Today's Focus</h3>
                        <Link to="/tasks" className={styles.cardHeaderLink}>Manage Tasks →</Link>
                    </div>
                    {dashboardData.todaysTasks.length > 0 ? (
                        <ul className={styles.taskList}>
                            {dashboardData.todaysTasks.map(task => <li key={task._id}>{task.title}</li>)}
                        </ul>
                    ) : (
                        <p className={styles.emptyText}>No tasks due today. Great job!</p>
                    )}
                </div>

                <div className={`${styles.card} ${styles.deadlinesCard}`}>
                     <div className={styles.cardHeader}>
                        <h3>Upcoming Deadlines</h3>
                    </div>
                    {dashboardData.upcomingDeadlines.length > 0 ? (
                        <ul className={styles.taskList}>
                            {dashboardData.upcomingDeadlines.map(item => (
                                <li key={item._id}>
                                    <strong>{item.title}</strong> - Due {new Date(item.dueDate).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.emptyText}>No deadlines in the next 7 days.</p>
                    )}
                </div>

                <div className={styles.statsColumn}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                           <h3>Quick Stats</h3>
                        </div>
                        <div className={styles.statBoxes}>
                            <div className={styles.statBox}>
                                <span>{dashboardData.leetCodeSolved ?? 'N/A'}</span>
                                <label>LeetCode Solved</label>
                            </div>
                            <div className={styles.statBox}>
                                <span>{dashboardData.booksFinished}</span>
                                <label>Books Finished</label>
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>Currently Reading</h3>
                        </div>
                        {dashboardData.currentlyReading ? (
                            <div>
                                <p className={styles.bookTitle}>{dashboardData.currentlyReading.title}</p>
                                <div className={styles.progressBar}>
                                    <div 
                                        className={styles.progressBarFill} 
                                        style={{ width: `${dashboardData.currentlyReading.progressPercent}%`}}
                                    ></div>
                                </div>
                                <p className={styles.progressText}>
                                    {dashboardData.currentlyReading.currentPage} / {dashboardData.currentlyReading.totalPages} pages ({dashboardData.currentlyReading.progressPercent}%)
                                </p>
                            </div>
                        ) : (
                             <p className={styles.emptyText}>No books being read.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

