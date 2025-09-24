import { api } from './client';

// Fetch the current user's profile information
export const getProfile = () => api.get('/user/profile').then(r => r.data);

// Update the user's settings (e.g., linked accounts)
export const updateProfile = (settings) => api.put('/user/profile', settings).then(r => r.data);

// Change the user's password
export const changePassword = (currentPassword, newPassword) => {
  return api.post('/user/change-password', { currentPassword, newPassword }).then(r => r.data);
};

// Verify the user's current password for sensitive actions
export const verifyPassword = (password) => {
  return api.post('/user/verify-password', { password }).then(r => r.data);
};