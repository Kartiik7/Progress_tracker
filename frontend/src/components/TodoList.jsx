import React, { useState, useEffect, useCallback } from 'react';
import * as taskApi from '../api/tasks';
import styles from './TodoList.module.css';

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState(''); // State for the new due date

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasks({ frequency: activeTab });
      // Sort tasks to show incomplete ones first
      const sortedTasks = data.sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'completed' ? 1 : -1;
      });
      setTasks(sortedTasks);
    } catch (error) {
      console.error(`Failed to fetch ${activeTab} tasks:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const payload = { 
        title: newTaskTitle, 
        frequency: activeTab,
        ...(newDueDate && { dueDate: newDueDate })
      };
      await taskApi.createTask(payload);
      setNewTaskTitle('');
      setNewDueDate('');
      fetchTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await taskApi.updateTask(task._id, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };
  
  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={activeTab === tabName ? styles.activeTab : styles.tab}
    >
      {label}
    </button>
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.header}>My To-Do List</h1>
      <div className={styles.tabs}>
        <TabButton tabName="daily" label="Daily" />
        <TabButton tabName="weekly" label="Weekly" />
        <TabButton tabName="monthly" label="Monthly" />
      </div>

      <form onSubmit={handleAddTask} className={styles.form}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className={styles.input}
        />
        <input 
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className={styles.dateInput}
        />
        <button type="submit" className={styles.button}>Add Task</button>
      </form>

      <div className={styles.taskList}>
        {loading ? <p>Loading tasks...</p> : (
          tasks.length > 0 ? tasks.map(task => (
            <div key={task._id} className={styles.taskItem}>
              <div className={styles.taskContent}>
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => handleToggleTask(task)}
                  className={styles.checkbox}
                />
                <div className={styles.taskInfo}>
                  <span className={task.status === 'completed' ? styles.completed : ''}>
                    {task.title}
                  </span>
                  {/* Display the due date if it exists */}
                  {task.dueDate && (
                    <span className={styles.dueDate}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => handleDeleteTask(task._id)} className={styles.deleteButton}>
                🗑️
              </button>
            </div>
          )) : <p className={styles.emptyState}>No tasks for this period. Add one above!</p>
        )}
      </div>
    </div>
  );
}

