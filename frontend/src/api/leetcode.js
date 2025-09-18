import api from './client'

export const getLeetCodeStats = (username) => api.get(`/leetcode/${username}`).then(r => r.data)
