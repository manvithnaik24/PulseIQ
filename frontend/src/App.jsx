import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'

function NotFound() {
  return (
    <div className="min-h-screen bg-bg-custom flex items-center justify-center p-8 text-center">
      <div className="space-y-4">
        <p className="text-8xl font-black text-primary/20">404</p>
        <h1 className="text-2xl font-bold text-slate-800">Page Not Found</h1>
        <p className="text-slate-500">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-all mt-4">
          Back to Home
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
