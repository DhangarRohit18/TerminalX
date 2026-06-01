import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logOut } from '../../firebase/auth';
import {
  LayoutDashboard, FileText, Briefcase, GitCompare,
  PlayCircle, BarChart3, Trophy, Award, Map,
  Users, Settings, LogOut, Zap, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Preparation',
    items: [
      { to: '/resume', icon: FileText, label: 'Resume Analyzer' },
      { to: '/job', icon: Briefcase, label: 'Job Description' },
      { to: '/match', icon: GitCompare, label: 'Match Engine' },
      { to: '/roadmap', icon: Map, label: 'Learning Roadmap' },
    ],
  },
  {
    label: 'Interview',
    items: [
      { to: '/interview/setup', icon: PlayCircle, label: 'Start Interview' },
    ],
  },
  {
    label: 'Compete',
    items: [
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { to: '/achievements', icon: Award, label: 'Achievements' },
    ],
  },
  {
    label: 'Recruiter',
    items: [
      { to: '/recruiter', icon: Users, label: 'Recruiter View' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpInLevel = xp % 500;
  const xpPercent = (xpInLevel / 500) * 100;
  const initials = (user?.displayName || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none' }} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">⚡</div>
          <span className="sidebar-logo-text">InterviewIQ</span>
        </div>

        {/* XP Bar */}
        <div className="xp-bar-container">
          <div className="xp-bar-header">
            <span className="xp-bar-level">Level {level}</span>
            <span className="text-xs text-muted">{xpInLevel}/500 XP</span>
          </div>
          <div className="xp-bar-progress">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="sidebar-section" style={{ paddingTop: '0.5rem', paddingBottom: '0.25rem' }}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon size={16} className="sidebar-nav-icon" />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.to === '/interview/setup' && (
                    <ChevronRight size={12} style={{ color: 'var(--primary-light)' }} />
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} style={{ marginBottom: '0.25rem' }}>
            <Settings size={16} className="sidebar-nav-icon" />
            Settings
          </NavLink>
          <button className="sidebar-nav-item w-full" onClick={handleLogout} style={{ color: 'var(--danger-light)' }}>
            <LogOut size={16} className="sidebar-nav-icon" />
            Sign Out
          </button>
          <div className="sidebar-user" style={{ marginTop: '0.75rem' }}>
            <div className="sidebar-avatar">
              {user?.photoURL ? <img src={user.photoURL} alt="" /> : initials}
            </div>
            <div>
              <div className="sidebar-user-name">{user?.displayName || 'User'}</div>
              <div className="sidebar-user-role">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Zap size={10} style={{ color: 'var(--warning)' }} />
                  {xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
