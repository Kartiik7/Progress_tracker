import { api } from './client';

/**
 * Fetches GitHub stats for the currently logged-in user.
 * The backend will use the username from the user's settings.
 */
export const getGithubStats = () => {
    return api.get('/github').then(r => r.data);
};