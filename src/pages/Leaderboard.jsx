import { useState, useEffect } from 'react';
import { getLeaderboard } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, TrendingUp, Filter } from 'lucide-react';

const MOCK_CANDIDATES = [
  { displayName: 'Priya Sharma', readinessScore: 96, totalInterviews: 28, level: 12, xp: 5800, streak: 21 },
  { displayName: 'Marcus Johnson', readinessScore: 93, totalInterviews: 22, level: 10, xp: 4900, streak: 14 },
  { displayName: 'Sarah Chen', readinessScore: 91, totalInterviews: 31, level: 11, xp: 5200, streak: 8 },
  { displayName: 'Arjun Patel', readinessScore: 89, totalInterviews: 19, level: 9, xp: 4300, streak: 17 },
  { displayName: 'Emily Rodriguez', readinessScore: 87, totalInterviews: 24, level: 10, xp: 4700, streak: 5 },
  { displayName: 'David Kim', readinessScore: 85, totalInterviews: 16, level: 8, xp: 3800, streak: 3 },
  { displayName: 'Aisha Mohammed', readinessScore: 83, totalInterviews: 20, level: 8, xp: 3600, streak: 12 },
  { displayName: 'Lucas Silva', readinessScore: 81, totalInterviews: 14, level: 7, xp: 3200, streak: 6 },
  { displayName: 'Nina Kowalski', readinessScore: 79, totalInterviews: 18, level: 7, xp: 3000, streak: 9 },
  { displayName: 'James Park', readinessScore: 77, totalInterviews: 12, level: 6, xp: 2800, streak: 2 },
];

export default function Leaderboard() {
  const { user, profile } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getLeaderboard(50).then(real => {
      const combined = [...real, ...MOCK_CANDIDATES].sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0));
      // Add current user if not in list
      if (profile && !combined.find(c => c.id === user?.uid)) {
        combined.push({ ...profile, uid: user?.uid, displayName: user?.displayName || 'You' });
        combined.sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0));
      }
      setCandidates(combined.slice(0, 50));
      setLoading(false);
    }).catch(() => { setCandidates(MOCK_CANDIDATES); setLoading(false); });
  }, [user, profile]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={16} style={{ color: '#F59E0B' }} />;
    if (rank === 2) return <Medal size={16} style={{ color: '#A1A1AA' }} />;
    if (rank === 3) return <Medal size={16} style={{ color: '#B45309' }} />;
    return null;
  };

  const userRank = profile ? candidates.findIndex(c => c.uid === user?.uid || c.displayName === (user?.displayName || 'You')) + 1 : null;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="section-eyebrow">Global Rankings</div>
          <h1 className="section-title">Leaderboard <span className="gradient-text">🏆</span></h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Top candidates ranked by Interview Readiness Score</p>
        </div>
        {userRank && (
          <div className="card" style={{ padding: '1rem 1.5rem', textAlign: 'center', border: '1px solid rgba(124,58,237,0.3)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Rank</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-light)', fontFamily: 'var(--font-display)' }}>#{userRank}</div>
          </div>
        )}
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-8" style={{ flexWrap: 'wrap' }}>
        {candidates.slice(0, 3).map((c, i) => {
          const podiumOrder = [1, 0, 2]; // Show #2 left, #1 center, #3 right
          const candidate = candidates[podiumOrder[i]];
          const rank = podiumOrder[i] + 1;
          const heights = ['14rem', '18rem', '12rem'];
          const colors = ['rgba(161,161,170,0.1)', 'rgba(245,158,11,0.1)', 'rgba(180,88,0,0.1)'];
          const borders = ['rgba(161,161,170,0.25)', 'rgba(245,158,11,0.3)', 'rgba(180,88,0,0.25)'];

          return (
            <div key={i} style={{
              flex: '0 0 180px',
              background: colors[i], border: `1px solid ${borders[i]}`,
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              height: heights[i],
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
              animation: `bounce-in ${0.5 + i * 0.15}s cubic-bezier(0.34,1.56,0.64,1) forwards`,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
              </div>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', margin: '0 auto 0.75rem' }}>
                {(candidate?.displayName || '?').slice(0,2).toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{candidate?.displayName?.split(' ')[0]}</div>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', color: rank === 1 ? '#F59E0B' : rank === 2 ? '#A1A1AA' : '#B45309', fontFamily: 'var(--font-display)' }}>{candidate?.readinessScore || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Readiness Score</div>
            </div>
          );
        })}
      </div>

      {/* Full Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontWeight: 700 }}>All Rankings</h3>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{candidates.length} candidates</div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4" style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span style={{ minWidth: '2.5rem' }}>#</span>
          <span style={{ flex: 1 }}>Candidate</span>
          <span style={{ minWidth: 80, textAlign: 'right' }}>Readiness</span>
          <span style={{ minWidth: 80, textAlign: 'right' }}>Interviews</span>
          <span style={{ minWidth: 60, textAlign: 'right' }}>Level</span>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '2rem', color: 'var(--muted)' }}>
            <div className="spinner spinner-primary" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          candidates.map((c, i) => {
            const rank = i + 1;
            const isMe = c.uid === user?.uid || c.displayName === (user?.displayName);
            return (
              <div key={i} className={`leaderboard-row rank-${rank <= 3 ? rank : ''}`}
                style={{ background: isMe ? 'rgba(124,58,237,0.08)' : undefined, border: isMe ? '1px solid rgba(124,58,237,0.25)' : undefined }}>
                <div className={`rank-badge ${rank <= 3 ? `rank-${rank}` : ''}`} style={{ background: rank > 3 ? 'var(--surface-2)' : undefined, color: rank > 3 ? 'var(--muted)' : undefined, minWidth: '2.5rem', justifyContent: 'center' }}>
                  {getRankIcon(rank) || rank}
                </div>
                <div className="flex items-center gap-3" style={{ flex: 1 }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>
                    {(c.displayName || '?').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {c.displayName || 'Anonymous'}
                      {isMe && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>You</span>}
                    </div>
                    {c.streak > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--warning)' }}>🔥 {c.streak} day streak</div>}
                  </div>
                </div>
                <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: (c.readinessScore||0) >= 80 ? 'var(--success)' : (c.readinessScore||0) >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                  {c.readinessScore || 0}
                </div>
                <div style={{ minWidth: 80, textAlign: 'right', fontSize: '0.875rem', color: 'var(--muted)' }}>{c.totalInterviews || 0}</div>
                <div style={{ minWidth: 60, textAlign: 'right' }}>
                  <span className="badge badge-ghost" style={{ fontSize: '0.7rem' }}>Lv.{c.level || 1}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
