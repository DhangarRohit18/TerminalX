import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLatestResume, getJobDescriptions } from '../firebase/firestore';
import { generateRoadmap } from '../ai/roadmapEngine';
import { Map, CheckCircle, Clock, BookOpen, Target, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_DAYS = [7, 15, 30];
const TYPE_ICONS = { study: '📚', practice: '💻', mock: '🎯', review: '✅' };
const TYPE_COLORS = { study: 'var(--secondary-light)', practice: 'var(--primary-light)', mock: 'var(--success)', review: 'var(--warning)' };

export default function LearningRoadmap() {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState(7);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedDays, setCompletedDays] = useState([]);
  const [expandedDay, setExpandedDay] = useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let resumeAnalysis = {}, jdAnalysis = {}, matchData = {};
      if (user) {
        const [resume, jds] = await Promise.all([getLatestResume(user.uid), getJobDescriptions(user.uid)]);
        if (resume) resumeAnalysis = resume;
        if (jds[0]) jdAnalysis = jds[0];
      }
      const result = await generateRoadmap({
        resumeAnalysis, jdAnalysis, matchData,
        readinessScore: profile?.readinessScore || 50,
        plan,
      });
      setRoadmap(result);
      setCompletedDays([]);
      toast.success(`${plan}-day roadmap generated!`);
    } catch (err) {
      toast.error('Generation failed. Please try again.');
      console.error(err);
    } finally { setLoading(false); }
  };

  const toggleDay = (day) => {
    setCompletedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const progress = roadmap ? Math.round((completedDays.length / roadmap.length) * 100) : 0;

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="section-eyebrow">Learning Roadmap</div>
        <h1 className="section-title">Personalized <span className="gradient-text">Study Plan</span></h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>AI generates a day-by-day interview prep plan based on your skill gaps and target role.</p>
      </div>

      {/* Plan Selector */}
      <div className="card mb-6" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Select Your Plan Duration</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>AI will generate a personalized day-by-day roadmap</div>
          </div>
          <div className="flex gap-3">
            {PLAN_DAYS.map(d => (
              <button key={d} id={`plan-${d}`}
                onClick={() => setPlan(d)}
                className={`btn ${plan === d ? 'btn-primary' : 'btn-ghost'}`}
                style={{ minWidth: 80 }}>
                {d} Days
              </button>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading} id="generate-roadmap-btn">
            {loading ? <><div className="spinner" /> Generating...</> : <><Map size={16} /> Generate Roadmap</>}
          </button>
        </div>
      </div>

      {/* Progress */}
      {roadmap && (
        <div className="card mb-6" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontWeight: 700 }}>Your Progress</div>
            <div style={{ fontWeight: 800, color: 'var(--primary-light)' }}>{completedDays.length}/{roadmap.length} days</div>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>{progress}% complete</div>
        </div>
      )}

      {loading && (
        <div className="card text-center" style={{ padding: '4rem' }}>
          <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto 1.5rem' }} />
          <p style={{ fontWeight: 600 }}>Generating your {plan}-day personalized roadmap...</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Analyzing your profile and skill gaps</p>
        </div>
      )}

      {!roadmap && !loading && (
        <div className="card text-center animate-fade-up" style={{ padding: '4rem', border: '2px dashed var(--border)' }}>
          <Map size={48} style={{ margin: '0 auto 1rem', color: 'var(--muted)', opacity: 0.4 }} />
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No roadmap yet</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Select your plan duration and click Generate Roadmap</p>
        </div>
      )}

      {roadmap && !loading && (
        <div className="animate-fade-up">
          {roadmap.map((day, i) => {
            const isDone = completedDays.includes(i);
            const isExpanded = expandedDay === i;
            return (
              <div key={i} className={`roadmap-day ${isDone ? 'completed' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setExpandedDay(isExpanded ? -1 : i)}>
                <div className={`roadmap-day-num`} style={{ background: isDone ? 'linear-gradient(135deg,var(--success),#059669)' : 'linear-gradient(135deg,var(--primary),var(--secondary))' }}>
                  {isDone ? '✓' : day.day}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{day.theme}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                        Focus: <span style={{ color: 'var(--primary-light)' }}>{day.focusSkill}</span>
                        {' · '}
                        <span style={{ color: 'var(--muted)' }}>{day.tasks?.length || 0} tasks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className={`btn btn-sm ${isDone ? 'btn-success' : 'btn-ghost'}`}
                        onClick={(e) => { e.stopPropagation(); toggleDay(i); }}
                        id={`day-complete-${i}`}
                      >
                        <CheckCircle size={13} />
                        {isDone ? 'Done' : 'Mark Done'}
                      </button>
                      {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="animate-fade-up" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--success)', fontStyle: 'italic' }}>
                        Goal: {day.goal}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {day.tasks?.map((task, ti) => (
                          <div key={ti} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{TYPE_ICONS[task.type] || '📌'}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{task.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{task.description}</div>
                              <div className="flex items-center gap-3">
                                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}><Clock size={10} style={{ verticalAlign: 'middle' }} /> {task.duration}</span>
                                <span style={{ fontSize: '0.7rem', color: TYPE_COLORS[task.type] || 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{task.type}</span>
                              </div>
                              {task.resources?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.resources.map((r, ri) => (
                                    <span key={ri} className="chip" style={{ fontSize: '0.68rem', padding: '0.1rem 0.5rem' }}>
                                      <BookOpen size={9} />{r}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
