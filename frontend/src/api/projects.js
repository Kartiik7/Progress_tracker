import api from './client';

export const getProjects = () => api.get('/projects').then(r => r.data);
export const createProject = (payload) => api.post('/projects', payload).then(r => r.data);
export const updateProject = (id, payload) => api.put(`/projects/${id}`, payload).then(r => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data);
