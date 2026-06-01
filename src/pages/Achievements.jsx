import { useAuth } from '../context/AuthContext';
import { unlockAchievement } from '../firebase/firestore';
import { Zap, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_ACHIEVEMENTS = [
  { id: 'first_interview', icon: '🎯', title: 'First Steps', desc: 'Complete your first interview', xp: 50 },
  { id: 'five_interviews', icon: '🔥', title: 'On Fire', desc: 'Complete 5 interviews', xp: 100 },
  { id: 'ten_interviews', icon: '⚡', title: 'Power User', desc: 'Complete 10 interviews', xp: 200 },
  { id: 'score_80', icon: '🌟', title: 'High Scorer', desc: 'Score 80+ in any interview', xp: 150 },
  { id: 'score_90', icon: '💎', title: 'Diamond Performance', desc: 'Score 90+ in any interview', xp: 300 },
  { id: 'perfect_100', icon: '🏆', title: 'Perfectionist', desc: 'Score 100 in any question', xp: 500 },
  { id: 'streak_7', icon: '🗓️', title: 'Week Warrior', desc: 'Maintain a 7-day streak', xp: 200 },
  { id: 'streak_30', icon: '🚀', title: 'Consistency King', desc: 'Maintain a 30-day streak', xp: 1000 },
  { id: 'resume_uploaded', icon: '📄', title: 'Resume Ready', desc: 'Upload your first resume', xp: 25 },
  { id: 'jd_analyzed', icon: '🔍', title: 'Job Detective', desc: 'Analyze your first job description', xp: 25 },
  { id: 'hard_interview', icon: '💪', title: 'Challenge Accepted', desc: 'Complete a Hard difficulty interview', xp: 150 },
  { id: 'all_types', icon: '🎭', title: 'Well Rounded', desc: 'Complete all 5 interview types', xp: 400 },
  { id: 'voice_mode', icon: '🎙️', title: 'Voice Pro', desc: 'Use voice mode in an interview', xp: 75 },
  { id: 'roadmap_done', icon: '🗺️', title: 'Planner', desc: 'Generate your learning roadmap', xp: 50 },
  { id: 'pdf_downloaded', icon: '📊', title: 'Report Master', desc: 'Download your first PDF report', xp: 50 },
];

function AchievementCard({ achievement, unlocked }) {
  return (
    <div className={`achievement-card ${unlocked ? 'unlocked' : ''}`}>
      <div className={`achievement-icon ${unlocked ? 'unlocked' : ''}`} style={{ position: 'relative' }}>
        <span style={{ fontSize: '1.75rem', filter: unlocked ? 'none' : 'grayscale(1)', opacity: unlocked ? 1 : 0.4 }}>
          {achievement.icon}
        </span>
        {!unlocked && <Lock size={12} style={{ position: 'absolute', bottom: 0, right: 0, color: 'var(--muted-2)', background: 'var(--surface)', borderRadius: '50%', padding: '1px' }} />}
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: unlocked ? 'var(--text)' : 'var(--muted)' }}>{achievement.title}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.4 }}>{achievement.desc}</div>
      <div className="flex items-center gap-1" style={{ fontSize: '0.72rem', color: unlocked ? 'var(--warning)' : 'var(--muted-2)', fontWeight: 600 }}>
        <Zap size={10} />{achievement.xp} XP
        {unlocked && <span className="badge badge-success" style={{ marginLeft: '0.25rem', fontSize: '0.6rem' }}>✓</span>}
      </div>
    </div>
  );
}

export default function Achievements() {
  const { user, profile } = useAuth();
  const unlocked = profile?.achievements || [];
  const unlockedCount = unlocked.length;
  const totalXP = ALL_ACHIEVEMENTS.filter(a => unlocked.includes(a.id)).reduce((s, a) => s + a.xp, 0);
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpInLevel = xp % 500;

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="section-eyebrow">Gamification</div>
        <h1 className="section-title">Achievements <span className="gradient-text">& XP</span></h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Earn XP, unlock badges, and track your progress as you level up your interview skills.</p>
      </div>

      {/* XP Card */}
      <div className="card mb-8" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(124,58,237,0.2)', padding: '2rem' }}>
        <div className="grid grid-4" style={{ gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg,var(--primary-light),var(--secondary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {level}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Current Level</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--warning)', fontFamily: 'var(--font-display)' }}>
              {xp.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Total XP</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
              {unlockedCount}/{ALL_ACHIEVEMENTS.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Badges Unlocked</div>
          </div>
          <div>
            <div className="flex justify-between mb-2" style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              <span>Level {level}</span>
              <span>{xpInLevel}/500 XP to Level {level+1}</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${(xpInLevel/500)*100}%` }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.5rem' }}>{500 - xpInLevel} XP until next level</div>
          </div>
        </div>
      </div>

      {/* Streak Display */}
      {(profile?.streak || 0) > 0 && (
        <div className="card mb-6" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: '2.5rem' }}>🔥</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--warning)' }}>{profile.streak} Day Streak!</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>You're on fire! Keep practicing daily to maintain your streak.</div>
          </div>
        </div>
      )}

      {/* Achievement Grid */}
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontWeight: 700 }}>All Badges</h3>
        <div className="flex items-center gap-2">
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Unlocked ({unlockedCount})</span>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--surface-3)', marginLeft: '0.5rem' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Locked ({ALL_ACHIEVEMENTS.length - unlockedCount})</span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        {ALL_ACHIEVEMENTS.map((ach, i) => (
          <AchievementCard key={ach.id} achievement={ach} unlocked={unlocked.includes(ach.id)} />
        ))}
      </div>
    </div>
  );
}
