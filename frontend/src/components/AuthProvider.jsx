import React, { useEffect, useMemo, useState } from 'react';
import { login as loginApi } from '../api/auth';
import { AuthContext } from './AuthContextBase';
import { useAuth } from './useAuth'; // Import the useAuth hook

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await loginApi(email, password);
      setToken(token);
      return true; // Indicate success
    } catch (e) {
      setError(e?.response?.data?.message || 'Login failed');
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
  };

  const value = useMemo(() => ({ token, login, logout, loading, error }), [token, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// This is the corrected Protected component
export function Protected({ children, fallback = null }) {
  const { token } = useAuth(); // Use the token from the context

  if (!token) {
    return fallback;
  }

  return children;
}

