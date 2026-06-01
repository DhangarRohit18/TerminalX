import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/resume': 'Resume Analyzer',
  '/job': 'Job Description',
  '/match': 'Match Engine',
  '/roadmap': 'Learning Roadmap',
  '/interview/setup': 'Interview Setup',
  '/leaderboard': 'Leaderboard',
  '/achievements': 'Achievements',
  '/recruiter': 'Recruiter View',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const { profile } = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'InterviewIQ AI';

  return (
    <header className="navbar">
      <div className="flex items-center gap-4">
        <button className="btn btn-ghost btn-icon" onClick={onMenuClick} id="menu-toggle" style={{ display: 'none' }}>
          <Menu size={18} />
        </button>
        <span className="navbar-title">{title}</span>
      </div>

      <div className="navbar-actions">
        {profile?.streak > 0 && (
          <div className="flex items-center gap-1" style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--warning)',
          }}>
            <Flame size={13} />
            {profile.streak} day streak
          </div>
        )}
        <button className="btn btn-ghost btn-icon" id="notifications-btn" title="Notifications">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
