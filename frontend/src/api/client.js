import axios from 'axios'

// Use the environment variable for the deployed backend,
// but fall back to the local server if it's not set.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

console.log(`API calls are being sent to: ${API_BASE}`); // Helps with debugging

export const api = axios.create({
    baseURL: API_BASE,
})

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})
