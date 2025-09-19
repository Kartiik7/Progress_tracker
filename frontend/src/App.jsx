import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Signup from './components/Signup'
import CalendarPage from './components/CalendarPage'
import LeetCodeStats from './components/LeetCodeStats'
import Projects from './components/Projects'
import TodoList from './components/TodoList'
import Bookshelf from './components/Bookshelf'
import SettingsPage from './components/SettingsPage' // <-- New Import
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Protected } from './context/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          element={
            <Protected fallback={<Navigate to="/login" replace />}> 
              <div className="app flex h-screen bg-gray-900 text-gray-100">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Outlet />
                </main>
              </div>
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<TodoList />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="projects" element={<Projects />} />
          <Route path="leetcode" element={<LeetCodeStats />} />
          <Route path="bookshelf" element={<Bookshelf />} />
          <Route path="settings" element={<SettingsPage />} /> {/* <-- Updated Route */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

