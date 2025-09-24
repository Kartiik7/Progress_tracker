import { api } from './client';

// --- Project-level functions ---
export const getProjects = (params = {}) => api.get('/projects', { params }).then(r => r.data);
export const createProject = (payload) => api.post('/projects', payload).then(r => r.data);
export const updateProject = (id, payload) => api.put(`/projects/${id}`, payload).then(r => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data);

// --- Sub-task functions ---
export const addSubTask = (projectId, payload) => api.post(`/projects/${projectId}/subtasks`, payload).then(r => r.data);
export const updateSubTask = (projectId, subtaskId, payload) => api.put(`/projects/${projectId}/subtasks/${subtaskId}`, payload).then(r => r.data);
export const deleteSubTask = (projectId, subtaskId) => api.delete(`/projects/${projectId}/subtasks/${subtaskId}`).then(r => r.data);