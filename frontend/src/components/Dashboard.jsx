import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../api/dashboard";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardData();
        setData(response);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading your dashboard...</div>;
  }

  if (error) {
    return <div className={styles.emptyState}>{error}</div>;
  }

  // This check ensures 'data' is not null before rendering
  if (!data) {
    return (
      <div className={styles.emptyState}>No dashboard data available.</div>
    );
  }

  const {
    welcomeMessage,
    todaysTasks,
    upcomingDeadlines,
    quickStats,
    currentlyReading,
  } = data;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.welcomeMessage}>{welcomeMessage}</h1>
        <p className={styles.welcomeSub}>Here's a summary of your progress.</p>
      </header>

      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.focus}`}>
          <div className={styles.cardHeader}>
            <h2>Today's Focus</h2>
            <Link to="/app/tasks" className={styles.cardHeaderLink}>
              Manage Tasks →
            </Link>
          </div>
          {todaysTasks.length > 0 ? (
            <ul>
              {todaysTasks.map((task) => (
                <li key={task._id} className={styles.listItem}>
                  <span className={styles.itemName}>{task.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>No tasks due today. Great job!</p>
          )}
        </div>

        <div className={`${styles.card} ${styles.deadlines}`}>
          <h2>Upcoming Deadlines</h2>
          {upcomingDeadlines.length > 0 ? (
            <ul>
              {upcomingDeadlines.map((item) => (
                <li key={item._id} className={styles.listItem}>
                  <span className={styles.itemName}>{item.title}</span>
                  <span className={styles.itemDate}>
                    {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>
              No deadlines in the next 7 days.
            </p>
          )}
        </div>

        <div className={`${styles.card} ${styles.stats}`}>
          <h2>Quick Stats</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {quickStats.leetcodeSolved}
              </div>
              <div className={styles.statLabel}>LeetCode Solved</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{quickStats.booksFinished}</div>
              <div className={styles.statLabel}>Books Finished</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.reading}`}>
          <h2>Currently Reading</h2>
          {currentlyReading ? (
            <div className={styles.bookProgress}>
              <p className={styles.itemName}>{currentlyReading.title}</p>
              <div className={styles.progress}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${Math.round(
                      (currentlyReading.currentPage /
                        currentlyReading.totalPages) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <p className={styles.progressText}>
                {currentlyReading.currentPage} / {currentlyReading.totalPages}{" "}
                pages
              </p>
            </div>
          ) : (
            <p className={styles.emptyState}>No book is being read.</p>
          )}
        </div>
      </div>
    </div>
  );
}
