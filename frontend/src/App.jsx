import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Protected } from './context/AuthContext';
import { useAuth } from './context/useAuth';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import HomePage from './components/HomePage';
import TodoList from './components/TodoList';
import Projects from './components/Projects';
import CalendarPage from './components/CalendarPage';
import LeetCodeStats from './components/LeetCodeStats';
import GitHubStats from './components/GitHubStats';
import Bookshelf from './components/Bookshelf';
import SettingsPage from './components/SettingsPage';


function App() {

  return (
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Application Routes */}
          <Route
            path="/app"
            element={
              <Protected fallback={<Navigate to="/login" replace />}>
                <div className="app-layout"> {/* This class is key */}
                  <Sidebar />
                  <main className="app-content"> {/* This class is key */}
                    <Outlet />
                  </main>
                </div>
              </Protected>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<TodoList />} />
            <Route path="projects" element={<Projects />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="leetcode" element={<LeetCodeStats />} />
            <Route path="github" element={<GitHubStats />} />
            <Route path="bookshelf" element={<Bookshelf />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;

