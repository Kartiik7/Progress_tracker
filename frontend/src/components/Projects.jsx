import React, { useState, useEffect, useCallback } from 'react';
import * as projectApi from '../api/projects';
import styles from './Projects.module.css';

// Main component for the Projects page
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    try {
      await projectApi.createProject({ title: newProjectTitle });
      setNewProjectTitle('');
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };
  
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this entire project?')) {
        try {
            await projectApi.deleteProject(projectId);
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    }
  };

  // Callback to refresh projects when a sub-task changes
  const onSubTaskChange = (updatedProject) => {
    setProjects(prevProjects => 
        prevProjects.map(p => p._id === updatedProject._id ? updatedProject : p)
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Projects</h1>
        <button onClick={() => setShowForm(!showForm)} className={styles.addProjectBtn}>
          {showForm ? 'Cancel' : '＋ New Project'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleAddProject} className={styles.addProjectForm}>
          <input
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="Enter new project title..."
            autoFocus
          />
          <button type="submit">Create Project</button>
        </form>
      )}

      {loading ? <p>Loading projects...</p> : (
        <div className={styles.projectList}>
          {projects.map(project => (
            <ProjectCard 
                key={project._id} 
                project={project}
                onDelete={handleDeleteProject}
                onSubTaskChange={onSubTaskChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Project Card Component ---
function ProjectCard({ project, onDelete, onSubTaskChange }) {
    const handleAddRootTask = async () => {
        const text = prompt("Enter new task title:");
        if (text) {
            try {
                const updatedProject = await projectApi.addSubTask(project._id, { text, parentId: null });
                onSubTaskChange(updatedProject);
            } catch (error) {
                console.error("Failed to add root task:", error);
            }
        }
    };

    return (
        <div className={styles.projectCard}>
            <div className={styles.projectCardHeader}>
                <h2>{project.title}</h2>
                <button onClick={() => onDelete(project._id)} className={styles.deleteProjectBtn}>🗑️</button>
            </div>
            <TaskList 
                projectId={project._id}
                tasks={project.subTasks}
                parentId={null}
                level={0}
                onTaskChange={onSubTaskChange}
            />
             <button onClick={handleAddRootTask} className={styles.addTaskBtn} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>+ Add a Task</button>
        </div>
    );
}

// --- Recursive Task List Component ---
function TaskList({ projectId, tasks, parentId, level, onTaskChange }) {
  if (!tasks || tasks.length === 0) {
    return null;
  }
  
  return (
    <div>
      {tasks.map(task => (
        <TaskItem 
            key={task._id} 
            projectId={projectId}
            task={task}
            level={level}
            onTaskChange={onTaskChange}
        />
      ))}
    </div>
  );
}

// --- Task Item Component ---
function TaskItem({ projectId, task, level, onTaskChange }) {

    const handleAddTask = async () => {
        const text = prompt("Enter sub-task title:");
        if (text) {
            try {
                const updatedProject = await projectApi.addSubTask(projectId, { text, parentId: task._id });
                onTaskChange(updatedProject);
            } catch (error) {
                console.error("Failed to add sub-task:", error);
            }
        }
    };
    
    const handleToggleComplete = async () => {
        try {
            const updatedProject = await projectApi.updateSubTask(projectId, task._id, { completed: !task.completed });
            onTaskChange(updatedProject);
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    const handleDeleteTask = async () => {
         if (window.confirm('Delete this task and all its sub-tasks?')) {
            try {
                const updatedProject = await projectApi.deleteSubTask(projectId, task._id);
                onTaskChange(updatedProject);
            } catch (error) {
                console.error("Failed to delete task:", error);
            }
        }
    };

  return (
    <div>
      <div className={styles.taskItem} style={{'--level': level}}>
        <div className={styles.taskContent}>
          <input 
            type="checkbox" 
            className={styles.checkbox} 
            checked={task.completed}
            onChange={handleToggleComplete}
          />
          <span className={`${styles.taskText} ${task.completed ? styles.completed : ''}`}>
            {task.text}
          </span>
        </div>
        <div className={styles.taskActions}>
            <button onClick={handleAddTask} className={styles.addTaskBtn} title="Add sub-task">+</button>
            <button onClick={handleDeleteTask} className={styles.deleteTaskBtn} title="Delete task">🗑️</button>
        </div>
      </div>
      
      <TaskList
        projectId={projectId}
        tasks={task.subTasks}
        parentId={task._id}
        level={level + 1}
        onTaskChange={onTaskChange}
      />
    </div>
  );
}

