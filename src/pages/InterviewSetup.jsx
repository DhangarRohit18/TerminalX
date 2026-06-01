import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLatestResume, getJobDescriptions, createInterview } from '../firebase/firestore';
import { PlayCircle, ChevronRight, Clock, Zap, Shield, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = [
  { id: 'Technical', icon: '💻', desc: 'Algorithms, Data Structures, System Design' },
  { id: 'Behavioral', icon: '🎯', desc: 'STAR method, Leadership, Teamwork' },
  { id: 'HR', icon: '👥', desc: 'Culture fit, Salary, Career goals' },
  { id: 'Scenario Based', icon: '🏗️', desc: 'Real-world work situations' },
  { id: 'Project Discussion', icon: '📋', desc: 'Deep-dive into your past projects' },
];

const DIFFICULTIES = [
  { id: 'Easy', icon: Shield, color: 'var(--success)', time: '60 sec', desc: 'Build confidence. Great for beginners.' },
  { id: 'Medium', icon: Target, color: 'var(--warning)', time: '90 sec', desc: 'Balanced challenge. Industry standard.' },
  { id: 'Hard', icon: Zap, color: 'var(--danger)', time: '120 sec', desc: 'FAANG-level. Push your limits.' },
];

export default function InterviewSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [useContext, setUseContext] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      let resumeSummary = '', jdSummary = '';
      if (useContext && user) {
        const [resume, jds] = await Promise.all([getLatestResume(user.uid), getJobDescriptions(user.uid)]);
        resumeSummary = resume?.summary || '';
        jdSummary = jds[0]?.summary || '';
      }
      const id = await createInterview(user.uid, { type, difficulty, count, resumeSummary, jdSummary, finalScore: null });
      navigate(`/interview/${id}`);
    } catch (err) {
      toast.error('Failed to start interview. Please try again.');
      console.error(err);
    } finally { setLoading(false); }
  };

  const selectedDiff = DIFFICULTIES.find(d => d.id === difficulty);

  return (
    <div className="page-container" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="mb-8 text-center">
        <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Interview Setup</div>
        <h1 className="section-title">Configure Your <span className="gradient-text">Interview</span></h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Personalize the AI interview to match your target role and skill level.</p>
      </div>

      {/* Interview Type */}
      <div className="card mb-6">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Interview Type</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {TYPES.map(t => (
            <button key={t.id} id={`type-${t.id.replace(/\s/g,'-')}`}
              onClick={() => setType(t.id)}
              style={{
                padding: '1rem',
                background: type === t.id ? 'rgba(124,58,237,0.15)' : 'var(--surface-2)',
                border: `1px solid ${type === t.id ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow: type === t.id ? '0 0 16px var(--primary-glow)' : 'none',
              }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: type === t.id ? 'var(--primary-light)' : 'var(--text)', marginBottom: '0.25rem' }}>{t.id}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="card mb-6">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Difficulty Level</h3>
        <div className="grid grid-3" style={{ gap: '1rem' }}>
          {DIFFICULTIES.map(d => (
            <button key={d.id} id={`diff-${d.id}`}
              onClick={() => setDifficulty(d.id)}
              style={{
                padding: '1.25rem',
                background: difficulty === d.id ? d.color + '12' : 'var(--surface-2)',
                border: `1px solid ${difficulty === d.id ? d.color + '50' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow: difficulty === d.id ? `0 0 16px ${d.color}30` : 'none',
              }}>
              <div className="flex items-center justify-between mb-2">
                <d.icon size={18} style={{ color: d.color }} />
                <div className="flex items-center gap-1" style={{ fontSize: '0.72rem', color: d.color, fontWeight: 600 }}>
                  <Clock size={10} />{d.time}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: difficulty === d.id ? d.color : 'var(--text)', marginBottom: '0.25rem' }}>{d.id}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Question Count */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Questions</h3>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary-light)', fontFamily: 'var(--font-display)' }}>{count}</div>
        </div>
        <input
          type="range" min={3} max={15} value={count} onChange={e => setCount(+e.target.value)} id="question-count-slider"
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
        <div className="flex justify-between mt-2" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
          <span>3 (Quick)</span>
          <span>~{Math.ceil(count * (selectedDiff?.id === 'Easy' ? 1 : selectedDiff?.id === 'Medium' ? 1.5 : 2))} min estimated</span>
          <span>15 (Full)</span>
        </div>
      </div>

      {/* Context Toggle */}
      {user && (
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Use Resume & JD Context</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>AI will personalize questions based on your resume and saved job description</div>
            </div>
            <button
              onClick={() => setUseContext(!useContext)}
              id="context-toggle"
              style={{
                width: 44, height: 24,
                background: useContext ? 'var(--primary)' : 'var(--surface-3)',
                borderRadius: '999px',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.2s',
                position: 'relative',
                flexShrink: 0,
              }}>
              <div style={{
                width: 18, height: 18, background: 'white', borderRadius: '50%',
                position: 'absolute', top: 3, left: useContext ? 23 : 3,
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        </div>
      )}

      {/* Start Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          className="btn btn-primary btn-xl animate-pulse-ring"
          onClick={handleStart}
          disabled={loading}
          id="start-interview-btn"
          style={{ minWidth: 240 }}
        >
          {loading ? <><div className="spinner" /> Starting...</> : <><PlayCircle size={20} /> Start Interview <ChevronRight size={18} /></>}
        </button>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '1rem' }}>
          {count} {type} questions · {difficulty} difficulty · {selectedDiff?.time}/question
        </p>
      </div>
    </div>
  );
}
