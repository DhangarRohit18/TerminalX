import { useState, useEffect } from 'react';
import { getLeaderboard } from '../firebase/firestore';
import { Users, Filter, TrendingUp, BarChart3, Eye, GitCompare } from 'lucide-react';

const MOCK_CANDIDATES = [
  { uid: '1', displayName: 'Priya Sharma', email: 'priya@example.com', readinessScore: 96, totalInterviews: 28, level: 12, xp: 5800, streak: 21 },
  { uid: '2', displayName: 'Marcus Johnson', email: 'marcus@example.com', readinessScore: 93, totalInterviews: 22, level: 10, xp: 4900, streak: 14 },
  { uid: '3', displayName: 'Sarah Chen', email: 'sarah@example.com', readinessScore: 91, totalInterviews: 31, level: 11, xp: 5200, streak: 8 },
  { uid: '4', displayName: 'Arjun Patel', email: 'arjun@example.com', readinessScore: 89, totalInterviews: 19, level: 9, xp: 4300, streak: 17 },
  { uid: '5', displayName: 'Emily Rodriguez', email: 'emily@example.com', readinessScore: 87, totalInterviews: 24, level: 10, xp: 4700, streak: 5 },
  { uid: '6', displayName: 'David Kim', email: 'david@example.com', readinessScore: 85, totalInterviews: 16, level: 8, xp: 3800, streak: 3 },
  { uid: '7', displayName: 'Aisha Mohammed', email: 'aisha@example.com', readinessScore: 83, totalInterviews: 20, level: 8, xp: 3600, streak: 12 },
  { uid: '8', displayName: 'Lucas Silva', email: 'lucas@example.com', readinessScore: 81, totalInterviews: 14, level: 7, xp: 3200, streak: 6 },
];

function ReadinessBadge({ score }) {
  const color = score >= 90 ? 'var(--success)' : score >= 75 ? 'var(--primary-light)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  const label = score >= 90 ? 'Interview Ready' : score >= 75 ? 'Strong' : score >= 60 ? 'Average' : 'Needs Work';
  return (
    <span style={{ padding: '0.2rem 0.6rem', background: color + '15', border: `1px solid ${color}30`, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color }}>{label}</span>
  );
}

export default function RecruiterView() {
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [viewCandidate, setViewCandidate] = useState(null);

  const filtered = candidates.filter(c => {
    if (filter === 'ready' && c.readinessScore < 90) return false;
    if (filter === 'strong' && (c.readinessScore < 75 || c.readinessScore >= 90)) return false;
    if (filter === 'average' && (c.readinessScore < 60 || c.readinessScore >= 75)) return false;
    if (search && !c.displayName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (uid) => {
    setSelected(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : prev.length < 2 ? [...prev, uid] : prev);
  };

  const compareA = candidates.find(c => c.uid === selected[0]);
  const compareB = candidates.find(c => c.uid === selected[1]);

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="section-eyebrow">Recruiter Mode</div>
        <h1 className="section-title">Candidate <span className="gradient-text">Dashboard</span></h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>View, filter, and compare candidates by readiness score and interview analytics.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-4 mb-6" style={{ gap: '1rem' }}>
        {[
          { label: 'Total Candidates', value: candidates.length, color: 'var(--primary-light)' },
          { label: 'Interview Ready', value: candidates.filter(c => c.readinessScore >= 90).length, color: 'var(--success)' },
          { label: 'Strong Candidates', value: candidates.filter(c => c.readinessScore >= 75 && c.readinessScore < 90).length, color: 'var(--secondary-light)' },
          { label: 'Avg Readiness', value: `${Math.round(candidates.reduce((s,c) => s+(c.readinessScore||0), 0)/candidates.length)}`, color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <div className="input-icon-wrapper" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <input className="input" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} id="recruiter-search" />
        </div>
        <div className="tabs" style={{ flex: 'none' }}>
          {[['all','All'],['ready','Interview Ready'],['strong','Strong'],['average','Average']].map(([val,label]) => (
            <button key={val} className={`tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)} id={`filter-${val}`}>{label}</button>
          ))}
        </div>
        {selected.length === 2 && (
          <button className="btn btn-secondary" id="compare-btn" onClick={() => {}}>
            <GitCompare size={14} /> Compare ({selected.length})
          </button>
        )}
        {selected.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
        )}
      </div>

      {/* Compare Panel */}
      {selected.length === 2 && compareA && compareB && (
        <div className="card mb-6" style={{ border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.04)' }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitCompare size={16} style={{ color: 'var(--secondary-light)' }} /> Candidate Comparison
          </div>
          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            {[compareA, compareB].map((c, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>{c.displayName}</div>
                {[
                  ['Readiness Score', c.readinessScore + '/100'],
                  ['Interviews Done', c.totalInterviews],
                  ['Level', `Level ${c.level}`],
                  ['Total XP', c.xp?.toLocaleString()],
                  ['Streak', `${c.streak} days`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate List */}
      <div>
        <div className="flex items-center gap-2 mb-3" style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          <Users size={13} /> {filtered.length} candidates
          {selected.length > 0 && <span className="badge badge-secondary">{selected.length} selected</span>}
          <span style={{ marginLeft: 'auto' }}>Select up to 2 to compare</span>
        </div>
        {filtered.map((c, i) => (
          <div key={c.uid} className="candidate-row" style={{
            background: selected.includes(c.uid) ? 'rgba(37,99,235,0.06)' : 'var(--surface)',
            border: `1px solid ${selected.includes(c.uid) ? 'rgba(37,99,235,0.3)' : 'var(--border)'}`,
          }}>
            {/* Select checkbox */}
            <input type="checkbox" checked={selected.includes(c.uid)} onChange={() => toggleSelect(c.uid)}
              id={`select-${c.uid}`}
              style={{ accentColor: 'var(--secondary)', width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />

            {/* Avatar */}
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
              {c.displayName.slice(0,2).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.displayName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.email} · Level {c.level} · {c.totalInterviews} interviews</div>
            </div>

            {/* Scores */}
            <div className="flex items-center gap-4">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: c.readinessScore >= 90 ? 'var(--success)' : c.readinessScore >= 75 ? 'var(--primary-light)' : c.readinessScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                  {c.readinessScore}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Readiness</div>
              </div>
              <ReadinessBadge score={c.readinessScore} />
              {c.streak > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>🔥 {c.streak}d</span>
              )}
              <button className="btn btn-ghost btn-sm" id={`view-${c.uid}`} onClick={() => setViewCandidate(viewCandidate?.uid === c.uid ? null : c)}>
                <Eye size={13} /> {viewCandidate?.uid === c.uid ? 'Hide' : 'View'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Detail Panel */}
      {viewCandidate && (
        <div className="card animate-fade-up mt-6" style={{ border: '1px solid rgba(124,58,237,0.2)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>{viewCandidate.displayName} — Detailed Analytics</h3>
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            {[
              { label: 'Readiness Score', value: `${viewCandidate.readinessScore}/100`, icon: TrendingUp, color: 'var(--success)' },
              { label: 'Interviews Completed', value: viewCandidate.totalInterviews, icon: BarChart3, color: 'var(--primary-light)' },
              { label: 'XP Earned', value: viewCandidate.xp?.toLocaleString(), icon: Users, color: 'var(--warning)' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <s.icon size={16} style={{ color: s.color, marginBottom: '0.5rem' }} />
                <div className="stat-card-value" style={{ fontSize: '1.5rem', color: s.color }}>{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ReadinessBadge score={viewCandidate.readinessScore} />
          </div>
        </div>
      )}
    </div>
  );
}
