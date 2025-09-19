import api from './client';

export const getUserProfile = () => api.get('/user/profile').then(r => r.data);
export const updateUserSettings = (settings) => api.put('/user/settings', settings).then(r => r.data);
export const changePassword = (passwords) => api.post('/user/change-password', passwords).then(r => r.data);
