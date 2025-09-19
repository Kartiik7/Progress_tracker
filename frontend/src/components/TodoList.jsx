import React, { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import styles from './TodoList.module.css';

const Spinner = () => <div className={styles.spinner}></div>;

export default function TodoList() {
    const [activeTab, setActiveTab] = useState('daily');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedTasks = await getTasks({ frequency: activeTab, category: 'general' });
            setTasks(fetchedTasks);
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
        if (!newTaskTitle.trim()) return;
        setIsSubmitting(true);
        try {
            const newTask = await createTask({
                title: newTaskTitle,
                frequency: activeTab,
                category: 'general', // Assign a general category to distinguish from others
            });
            setTasks([newTask, ...tasks]);
            setNewTaskTitle('');
        } catch (error) {
            console.error('Failed to add task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleTask = async (task) => {
        try {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            const updatedTask = await updateTask(task._id, { status: newStatus });
            setTasks(tasks.map(t => t._id === task._id ? updatedTask : t));
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(taskId);
                setTasks(tasks.filter(t => t._id !== taskId));
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>My To-Do List</h1>

            <div className={styles.card}>
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'daily' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('daily')}
                    >
                        Daily
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Weekly
                    </button>
                     <button 
                        className={`${styles.tab} ${activeTab === 'monthly' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('monthly')}
                    >
                        Monthly
                    </button>
                </div>

                <form onSubmit={handleAddTask} className={styles.form}>
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder={`Add a new ${activeTab} task...`}
                        className={styles.input}
                    />
                    <button type="submit" className={styles.addButton} disabled={isSubmitting}>
                        {isSubmitting ? <Spinner /> : 'Add'}
                    </button>
                </form>

                <div className={styles.taskList}>
                    {loading ? (
                        <p className={styles.loadingText}>Loading tasks...</p>
                    ) : tasks.length > 0 ? (
                        tasks.map(task => (
                            <div key={task._id} className={styles.taskItem}>
                                <input 
                                    type="checkbox"
                                    checked={task.status === 'completed'}
                                    onChange={() => handleToggleTask(task)}
                                    className={styles.checkbox}
                                />
                                <span className={`${styles.taskTitle} ${task.status === 'completed' ? styles.completed : ''}`}>
                                    {task.title}
                                </span>
                                <button onClick={() => handleDeleteTask(task._id)} className={styles.deleteButton}>
                                    &times;
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className={styles.emptyText}>No {activeTab} tasks yet. Add one above!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
