import api from './client';

export const getDashboardSummary = () => api.get('/dashboard').then(r => r.data);
