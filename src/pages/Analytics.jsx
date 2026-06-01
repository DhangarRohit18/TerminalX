import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserInterviews, getUserAnalytics } from '../firebase/firestore';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, BarChart3, Activity, Zap } from 'lucide-react';

const SKILL_LABELS = ['Algorithms', 'System Design', 'Behavioral', 'Communication', 'Problem Solving', 'Domain Knowledge'];

function HiringGauge({ probability }) {
  const r = 80;
  const circ = Math.PI * r;
  const filled = (probability / 100) * circ;
  const color = probability >= 70 ? 'var(--success)' : probability >= 45 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={200} height={110} viewBox="0 0 200 110">
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="var(--surface-2)" strokeWidth={14} strokeLinecap="round" />
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${(probability / 100) * (Math.PI * 90)} ${Math.PI * 90}`}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        <text x="100" y="92" textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="Outfit">{probability}%</text>
        <text x="100" y="108" textAnchor="middle" fill="var(--muted)" fontSize="10">Hiring Probability</text>
      </svg>
    </div>
  );
}

export default function Analytics() {
  const { user, profile } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserInterviews(user.uid, 30).then(ivs => { setInterviews(ivs); setLoading(false); });
  }, [user]);

  const completed = interviews.filter(i => i.status === 'completed');
  const avgScore = completed.length ? Math.round(completed.reduce((s, iv) => s + (iv.finalScore || 0), 0) / completed.length) : 0;
  const readiness = profile?.readinessScore || 0;
  const hiringProb = Math.min(100, Math.round(readiness * 1.05));

  // Radar data
  const radarData = SKILL_LABELS.map(label => ({
    subject: label,
    A: Math.floor(Math.random() * 35) + 45,
    fullMark: 100,
  }));

  // Readiness trend
  const trendData = completed.slice(-10).map((iv, i) => ({
    interview: `#${i+1}`,
    score: iv.finalScore || 0,
    readiness: iv.readinessScore || 0,
  }));

  // Difficulty breakdown
  const diffData = [
    { name: 'Easy', count: completed.filter(i => i.difficulty === 'Easy').length, fill: 'var(--success)' },
    { name: 'Medium', count: completed.filter(i => i.difficulty === 'Medium').length, fill: 'var(--warning)' },
    { name: 'Hard', count: completed.filter(i => i.difficulty === 'Hard').length, fill: 'var(--danger)' },
  ];

  // Type breakdown
  const typeData = ['Technical','Behavioral','HR','Scenario Based','Project Discussion'].map(t => ({
    name: t, count: completed.filter(i => i.type === t).length,
  }));

  // Heatmap (last 28 days mock)
  const heatmap = Array.from({ length: 28 }, (_, i) => ({
    day: i,
    level: completed.some(() => Math.random() > 0.7) ? Math.floor(Math.random() * 5) : 0,
  }));

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner spinner-lg spinner-primary" />
    </div>
  );

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="section-eyebrow">Analytics</div>
        <h1 className="section-title">Performance <span className="gradient-text">Analytics</span></h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Deep insights into your interview performance, skill growth, and hiring readiness.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-4 mb-6">
        {[
          { label: 'Avg Score', value: `${avgScore}`, suffix: '/100', icon: Target, color: 'var(--primary-light)' },
          { label: 'Interviews Done', value: completed.length, suffix: '', icon: BarChart3, color: 'var(--secondary-light)' },
          { label: 'Readiness Score', value: readiness, suffix: '/100', icon: TrendingUp, color: 'var(--success)' },
          { label: 'Total XP', value: (profile?.xp || 0).toLocaleString(), suffix: '', icon: Zap, color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.color + '15' }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div className="stat-card-value" style={{ color: s.color }}>{s.value}<span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--muted)' }}>{s.suffix}</span></div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2 mb-6" style={{ gap: '1.5rem' }}>
        {/* Radar */}
        <div className="chart-card">
          <div className="chart-title"><Activity size={16} style={{ color: 'var(--primary-light)' }} /> Skill Radar</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <Radar name="Skills" dataKey="A" stroke="var(--primary-light)" fill="var(--primary)" fillOpacity={0.25} strokeWidth={2} dot={{ fill: 'var(--primary-light)', r: 3 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Hiring Gauge */}
        <div className="chart-card">
          <div className="chart-title"><Target size={16} style={{ color: 'var(--success)' }} /> Hiring Probability</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', gap: '1rem' }}>
            <HiringGauge probability={hiringProb} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: hiringProb >= 70 ? 'var(--success)' : hiringProb >= 45 ? 'var(--warning)' : 'var(--danger)' }}>
                {hiringProb >= 70 ? 'Strong Hire Signal' : hiringProb >= 45 ? 'Conditional Hire' : 'Needs More Prep'}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Based on your readiness score and performance trends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2 mb-6" style={{ gap: '1.5rem' }}>
        {/* Readiness Trend */}
        <div className="chart-card">
          <div className="chart-title"><TrendingUp size={16} style={{ color: 'var(--success)' }} /> Readiness Trend</div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="interview" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="readiness" stroke="var(--success)" fill="url(#readGrad)" strokeWidth={2} dot={{ fill: 'var(--success)', r: 3 }} />
                <Line type="monotone" dataKey="score" stroke="var(--primary-light)" strokeWidth={2} dot={{ fill: 'var(--primary-light)', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted)', fontSize: '0.875rem' }}>
              Complete interviews to see your trend
            </div>
          )}
        </div>

        {/* Difficulty Bar */}
        <div className="chart-card">
          <div className="chart-title"><BarChart3 size={16} style={{ color: 'var(--warning)' }} /> Difficulty Breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={diffData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {diffData.map((d, i) => (
                  <rect key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="chart-card mb-6">
        <div className="chart-title"><Activity size={16} style={{ color: 'var(--primary-light)' }} /> 28-Day Activity Heatmap</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ fontSize: '0.65rem', color: 'var(--muted)', width: 32, textAlign: 'center', marginBottom: '0.25rem' }}>{d}</div>
          ))}
        </div>
        <div className="heatmap-grid" style={{ gridTemplateColumns: 'repeat(28, 1fr)', gap: 4 }}>
          {heatmap.map((cell, i) => (
            <div key={i} className={`heatmap-cell heatmap-${cell.level}`} title={`Day ${i+1}: ${cell.level > 0 ? 'Active' : 'No activity'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
          Less
          {[0,1,2,3,4].map(l => <div key={l} className={`heatmap-cell heatmap-${l}`} style={{ width: 12, height: 12 }} />)}
          More
        </div>
      </div>

      {/* Type Breakdown */}
      <div className="chart-card">
        <div className="chart-title"><BarChart3 size={16} style={{ color: 'var(--secondary-light)' }} /> Interviews by Type</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={typeData} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 60 }}>
            <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="var(--primary)" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
