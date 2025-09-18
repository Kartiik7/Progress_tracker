import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Signup from './components/Signup'
import CalendarWidget from './components/CalendarWidget'
import CodingStats from './components/CodingStats'
import BookGoal from './components/BookGoal'
import Projects from './components/Projects' // Import the new Projects component
import LeetCodeStats from './components/LeetCodeStats'
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
                <main className="flex-1 p-6 overflow-auto">
                  <Outlet />
                </main>
              </div>
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarWidget />} />
          <Route path="coding" element={<CodingStats />} />
          <Route path="leetcode" element={<LeetCodeStats />} />
          <Route path="book" element={<BookGoal />} />
          <Route path="projects" element={<Projects />} /> {/* Add new projects route */}
          <Route path="settings" element={<div className="text-gray-300">Settings coming soon</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

