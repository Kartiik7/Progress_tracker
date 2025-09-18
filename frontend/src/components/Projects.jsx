import React, { useState, useEffect, useMemo } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';
import styles from './Projects.module.css'; // Import the new CSS module

// Helper function for a nice loading spinner
const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// Main Projects Component
export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Fetch projects from the API when the component mounts
    useEffect(() => {
        getProjects()
            .then(setProjects)
            .catch(err => console.error("Failed to fetch projects:", err))
            .finally(() => setLoading(false));
    }, []);

    // Handler to create a new project
    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectTitle.trim()) return;

        setIsCreating(true);
        try {
            const newProject = await createProject({ title: newProjectTitle, description: newProjectDescription });
            setProjects([newProject, ...projects]);
            setNewProjectTitle('');
            setNewProjectDescription('');
        } catch (error) {
            console.error("Failed to create project:", error);
        } finally {
            setIsCreating(false);
        }
    };

    // Handler to delete a project
    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject(projectId);
                setProjects(projects.filter(p => p._id !== projectId));
            } catch (error) {
                console.error("Failed to delete project:", error);
            }
        }
    };
    
    // Update a project in the local state
    const updateLocalProject = (updatedProject) => {
        setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
    };


    if (loading) {
        return <div className="text-center text-gray-400">Loading projects...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>My Projects</h1>

            {/* Form to create a new project */}
            <div className={styles.formCard}>
                <form onSubmit={handleCreateProject}>
                    <h2 className={styles.formTitle}>Add a New Project</h2>
                    <div style={{marginBottom: '1rem'}}>
                        <input
                            type="text"
                            value={newProjectTitle}
                            onChange={(e) => setNewProjectTitle(e.target.value)}
                            placeholder="Project Title (e.g., History Research Paper)"
                            className={styles.input}
                        />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                        <textarea
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            placeholder="Brief description (optional)"
                            rows="2"
                            className={styles.textarea}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className={styles.submitButton}
                    >
                        {isCreating && <Spinner />}
                        {isCreating ? 'Adding...' : 'Add Project'}
                    </button>
                </form>
            </div>

            {/* List of existing projects */}
            <div className={styles.projectList}>
                 {projects.length > 0 ? (
                    projects.map(project => (
                        <ProjectCard 
                            key={project._id} 
                            project={project}
                            onDelete={handleDeleteProject}
                            onUpdate={updateLocalProject}
                        />
                    ))
                ) : (
                     <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700">
                        <p className="text-gray-400">You haven't added any projects yet.</p>
                        <p className="text-gray-500 text-sm">Use the form above to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}


// Component for a single project card
function ProjectCard({ project, onDelete, onUpdate }) {
    const [newSubTask, setNewSubTask] = useState('');

    const completedCount = useMemo(() => project.subTasks.filter(st => st.completed).length, [project.subTasks]);
    const totalCount = project.subTasks.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleAddSubTask = async (e) => {
        e.preventDefault();
        if (!newSubTask.trim()) return;

        const updatedSubTasks = [...project.subTasks, { title: newSubTask, completed: false }];
        try {
            const updatedProject = await updateProject(project._id, { subTasks: updatedSubTasks });
            onUpdate(updatedProject);
            setNewSubTask('');
        } catch (error) {
            console.error("Failed to add sub-task:", error);
        }
    };

    const handleToggleSubTask = async (subTaskId) => {
        const updatedSubTasks = project.subTasks.map(st =>
            st._id === subTaskId ? { ...st, completed: !st.completed } : st
        );
        try {
            const updatedProject = await updateProject(project._id, { subTasks: updatedSubTasks });
            onUpdate(updatedProject);
        } catch (error) {
            console.error("Failed to toggle sub-task:", error);
        }
    };
    
    return (
        <div className={styles.projectCard}>
            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    <p className={styles.cardDescription}>{project.description}</p>
                </div>
                 <button 
                    onClick={() => onDelete(project._id)}
                    className={styles.deleteButton}
                >
                    DELETE
                </button>
            </div>
            
            {/* Progress Bar */}
            <div>
                 <div className={styles.progressContainer}>
                    <span className={styles.progressLabel}>Progress</span>
                    <span className={styles.progressText}>{completedCount} / {totalCount} tasks</span>
                </div>
                <div className={styles.progressBarTrack}>
                    <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Sub-tasks list */}
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-300">Sub-tasks</h4>
                <div className={styles.subTaskList}>
                    {project.subTasks.map(subTask => (
                        <div key={subTask._id} className={styles.subTaskItem}>
                            <input
                                type="checkbox"
                                checked={subTask.completed}
                                onChange={() => handleToggleSubTask(subTask._id)}
                                className={styles.checkbox}
                            />
                            <span className={`${styles.subTaskTitle} ${subTask.completed ? styles.subTaskTitleCompleted : ''}`}>
                                {subTask.title}
                            </span>
                        </div>
                    ))}
                </div>
                {project.subTasks.length === 0 && <p className="text-xs text-gray-500">No sub-tasks yet.</p>}
            </div>

            {/* Add sub-task form */}
            <form onSubmit={handleAddSubTask} className="flex gap-2 pt-2">
                <input
                    type="text"
                    value={newSubTask}
                    onChange={(e) => setNewSubTask(e.target.value)}
                    placeholder="Add a new sub-task..."
                    className={styles.input}
                    style={{flexGrow: 1, fontSize: '0.875rem'}}
                />
                <button type="submit" className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-semibold">Add</button>
            </form>
        </div>
    );
}

