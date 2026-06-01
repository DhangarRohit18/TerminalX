import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserInterviews, getUserAnalytics } from '../firebase/firestore';
import { getReadinessCategory } from '../ai/evaluationEngine';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { PlayCircle, FileText, TrendingUp, Award, ArrowRight, Clock, Target, Zap, ChevronRight, Star } from 'lucide-react';

const SKILL_LABELS = ['Algorithms', 'System Design', 'Behavioral', 'Communication', 'Problem Solving', 'Domain Knowledge'];

function ScoreRing({ score, size = 140, strokeWidth = 10 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const cat = getReadinessCategory(score);
  const colorMap = { success: '#10B981', primary: '#8B5CF6', warning: '#F59E0B', danger: '#EF4444' };
  const color = colorMap[cat.color];

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color }}>{score}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Readiness</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getUserInterviews(user.uid, 10),
      getUserAnalytics(user.uid),
    ]).then(([ivs, an]) => {
      setInterviews(ivs);
      setAnalytics(an);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const hasData = completedInterviews.length > 0;

  const readiness = profile?.readinessScore || 0;
  const totalInterviews = profile?.totalInterviews || 0;
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const streak = profile?.streak || 0;

  const displayReadiness = hasData ? readiness : 83;
  const displayTotal = hasData ? totalInterviews : 14;
  const displayXP = hasData ? xp : 1250;
  const displayStreak = hasData ? streak : 5;
  const displayLevel = hasData ? level : 3;

  const cat = getReadinessCategory(displayReadiness);

  // Build radar data
  const radarData = SKILL_LABELS.map((label, idx) => {
    const mockVals = [85, 72, 90, 88, 76, 80];
    return {
      subject: label,
      A: mockVals[idx],
      fullMark: 100,
    };
  });

  // Build weekly progress data
  const mockWeekScores = [70, 75, 72, 78, 83, 85, 83];
  const weekData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
    day,
    score: hasData 
      ? (interviews[i] ? Math.round(interviews[i].scores?.reduce((s,x)=>s+x,0)/Math.max(1,interviews[i].scores?.length)||0) : 0)
      : mockWeekScores[i],
  }));

  const MOCK_INTERVIEWS = [
    { id: 'mock-1', type: 'Technical', difficulty: 'Medium', finalScore: 84, createdAt: { toDate: () => new Date(Date.now() - 24*3600*1000) }, status: 'completed' },
    { id: 'mock-2', type: 'Behavioral', difficulty: 'Hard', finalScore: 88, createdAt: { toDate: () => new Date(Date.now() - 3*24*3600*1000) }, status: 'completed' },
    { id: 'mock-3', type: 'Scenario Based', difficulty: 'Hard', finalScore: 76, createdAt: { toDate: () => new Date(Date.now() - 5*24*3600*1000) }, status: 'completed' },
    { id: 'mock-4', type: 'HR Screening', difficulty: 'Easy', finalScore: 92, createdAt: { toDate: () => new Date(Date.now() - 7*24*3600*1000) }, status: 'completed' },
  ];

  const displayInterviews = interviews.length > 0 ? interviews : MOCK_INTERVIEWS;

  const STATS = [
    { label: 'Readiness Score', value: displayReadiness, suffix: '', icon: Target, color: '#10B981', bg: 'rgba(16,185,129,0.1)', change: '+12 this week' },
    { label: 'Total Interviews', value: displayTotal, suffix: '', icon: PlayCircle, color: '#8B5CF6', bg: 'rgba(124,58,237,0.1)', change: `${completedInterviews.length} completed` },
    { label: 'XP Earned', value: displayXP, suffix: '', icon: Zap, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', change: `Level ${displayLevel}` },
    { label: 'Day Streak', value: displayStreak, suffix: ' days', icon: Star, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', change: displayStreak > 0 ? 'Keep it up! 🔥' : 'Start today!' },
  ];

  const RECOMMENDATIONS = [
    { title: 'Practice System Design', desc: 'Your lowest scoring area. Focus on scalability patterns.', icon: '🏗️', link: '/interview/setup', diff: 'Hard' },
    { title: 'Behavioral Questions', desc: 'Improve STAR method answers for better communication scores.', icon: '🎯', link: '/interview/setup', diff: 'Medium' },
    { title: 'Update Your Resume', desc: 'Add recent projects to improve your match score.', icon: '📄', link: '/resume', diff: null },
  ];

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--muted)' }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'Candidate'}</span> 👋
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {cat.description} — {readiness > 0 ? `Readiness: ${cat.label}` : 'Complete your first interview to get started.'}
          </p>
        </div>
        <Link to="/interview/setup" className="btn btn-primary" id="dashboard-start-btn">
          <PlayCircle size={16} />
          Start Interview
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="dashboard-grid mb-6">
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div className="stat-card-value" style={{ color: s.color }}>{s.value.toLocaleString()}{s.suffix}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-change positive">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-chart-grid mb-6">
        {/* Readiness + Radar */}
        <div className="chart-card">
          <div className="chart-title">
            <Target size={16} style={{ color: 'var(--primary-light)' }} />
            Interview Readiness
          </div>
          <div className="flex gap-6 items-center" style={{ flexWrap: 'wrap' }}>
            <div>
              <ScoreRing score={readiness} />
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <span className={`badge badge-${cat.color === 'success' ? 'success' : cat.color === 'primary' ? 'primary' : cat.color === 'warning' ? 'warning' : 'danger'}`}>
                  {cat.label}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 10 }} />
                  <Radar name="Skills" dataKey="A" stroke="var(--primary-light)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="chart-card">
          <div className="chart-title">
            <TrendingUp size={16} style={{ color: 'var(--success)' }} />
            Weekly Progress
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--primary-light)" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: 'var(--primary-light)', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-grid">
        {/* Recent Activity */}
        <div className="chart-card">
          <div className="chart-title">
            <Clock size={16} style={{ color: 'var(--muted)' }} />
            Recent Interviews
          </div>
          {displayInterviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
              <PlayCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No interviews yet. <Link to="/interview/setup" style={{ color: 'var(--primary-light)' }}>Start your first one!</Link></p>
            </div>
          ) : (
            <div>
              {displayInterviews.slice(0, 5).map((iv, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: '0.875rem 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: iv.status === 'completed' ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{iv.type} — {iv.difficulty}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{iv.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {iv.finalScore != null && (
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: iv.finalScore >= 80 ? 'var(--success)' : iv.finalScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                        {iv.finalScore}
                      </span>
                    )}
                    {iv.status === 'completed' && (
                      <Link to={`/interview/${iv.id}/replay`} className="btn btn-ghost btn-sm">
                        <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              <Link to="/analytics" className="btn btn-ghost btn-sm w-full mt-4">View All Activity</Link>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="chart-card">
          <div className="chart-title">
            <Award size={16} style={{ color: 'var(--warning)' }} />
            Recommendations
          </div>
          {RECOMMENDATIONS.map((rec, i) => (
            <Link key={i} to={rec.link} style={{ display: 'block', textDecoration: 'none' }}>
              <div className="flex gap-3" style={{ padding: '0.875rem 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.paddingLeft = '0.5rem'}
                onMouseOut={e => e.currentTarget.style.paddingLeft = '0'}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{rec.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{rec.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{rec.desc}</div>
                </div>
                {rec.diff && (
                  <span className={`badge badge-${rec.diff === 'Hard' ? 'danger' : 'warning'}`} style={{ alignSelf: 'flex-start', flexShrink: 0 }}>{rec.diff}</span>
                )}
              </div>
            </Link>
          ))}
          <Link to="/roadmap" className="btn btn-primary btn-sm w-full mt-4">
            View Full Roadmap
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
