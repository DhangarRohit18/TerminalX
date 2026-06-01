import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JDAnalyzer from './pages/JDAnalyzer';
import MatchEngine from './pages/MatchEngine';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import InterviewReplay from './pages/InterviewReplay';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import LearningRoadmap from './pages/LearningRoadmap';
import RecruiterView from './pages/RecruiterView';
import Settings from './pages/Settings';

// Pages that don't use the app shell
const PUBLIC_ROUTES = ['/', '/auth'];
const SESSION_ROUTES = ['/interview/'];

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="page-loader">
      <div className="page-loader-logo">InterviewIQ AI</div>
      <div className="spinner spinner-lg" style={{ borderColor: 'rgba(124,58,237,0.3)', borderTopColor: 'var(--primary-light)' }} />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading } = useAuth();
  if (loading) return null;
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isPublic = PUBLIC_ROUTES.includes(location.pathname);
  const isSession = location.pathname.startsWith('/interview/') && !location.pathname.includes('/replay');

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      {/* Interview Session — no sidebar */}
      <Route path="/interview/:id" element={
        <ProtectedRoute>
          <InterviewSession />
        </ProtectedRoute>
      } />

      {/* App Shell Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><AppShell><ResumeAnalyzer /></AppShell></ProtectedRoute>} />
      <Route path="/job" element={<ProtectedRoute><AppShell><JDAnalyzer /></AppShell></ProtectedRoute>} />
      <Route path="/match" element={<ProtectedRoute><AppShell><MatchEngine /></AppShell></ProtectedRoute>} />
      <Route path="/interview/setup" element={<ProtectedRoute><AppShell><InterviewSetup /></AppShell></ProtectedRoute>} />
      <Route path="/interview/:id/replay" element={<ProtectedRoute><AppShell><InterviewReplay /></AppShell></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppShell><Analytics /></AppShell></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><AppShell><Leaderboard /></AppShell></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><AppShell><Achievements /></AppShell></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><AppShell><LearningRoadmap /></AppShell></ProtectedRoute>} />
      <Route path="/recruiter" element={<ProtectedRoute><AppShell><RecruiterView /></AppShell></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="noise-overlay" />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
            error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
