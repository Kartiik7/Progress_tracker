import { api } from './client';

// Fetches stats for the CURRENTLY LOGGED-IN user. No username needed.
export const getLeetCodeStats = () => api.get('/leetcode').then(res => res.data);