import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import ReviewPage from './pages/ReviewPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-6 items-center">
          <span className="font-semibold text-gray-900 mr-4">Contract Copilot</span>
          {[
            { to: '/', label: 'Dashboard' },
            { to: '/upload', label: 'Upload' },
            { to: '/history', label: 'History' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
