import { api } from './client'

export const signup = (email, password) => api.post('/auth/signup', { email, password })
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}