import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Protected } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import CalendarPage from './components/CalendarPage';
import LeetCodeStats from './components/LeetCodeStats';
import Bookshelf from './components/Bookshelf';
import Projects from './components/Projects';
import TodoList from './components/TodoList';
import SettingsPage from './components/SettingsPage';
import HomePage from './components/HomePage'; // Import the new Home Page
import GitHub from './components/GitHubStats';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Application Layout */}
        <Route
          path="/app"
          element={
            <Protected fallback={<Navigate to="/login" replace />}> 
              <div className="flex h-screen bg-gray-900 text-gray-100">
                <Sidebar />
                <main className="flex-1 overflow-auto">
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
          <Route path="bookshelf" element={<Bookshelf />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="github" element={<GitHub/>}></Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

