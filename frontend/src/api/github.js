import api from './client';

export const getGithubStats = (username) => {
  return api.get(`/github/${username}`).then(r => r.data);
};
