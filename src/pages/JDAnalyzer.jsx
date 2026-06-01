import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeJD } from '../ai/jdAnalyzer';
import { saveJobDescription } from '../firebase/firestore';
import { Briefcase, Tag, CheckCircle, Users, BookOpen, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JDAnalyzer() {
  const { user } = useAuth();
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalyze = async () => {
    if (!jdText.trim() || jdText.length < 50) { toast.error('Please paste a job description (at least 50 characters)'); return; }
    setLoading(true);
    try {
      const result = await analyzeJD(jdText);
      setAnalysis(result);
      if (user) await saveJobDescription(user.uid, { rawText: jdText, ...result });
      toast.success('Job description analyzed!');
    } catch { toast.error('Analysis failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="section-eyebrow">Job Description</div>
        <h1 className="section-title">JD <span className="gradient-text">Analyzer</span></h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Paste a job description to extract required skills, responsibilities, and generate interview preparation topics.</p>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Left: Input */}
        <div>
          <div className="input-group mb-4">
            <label className="input-label">Job Description Text</label>
            <textarea
              className="input"
              style={{ minHeight: 360, fontSize: '0.85rem', lineHeight: 1.7 }}
              placeholder="Paste the full job description here...&#10;&#10;Example:&#10;Senior Software Engineer - Full Stack&#10;&#10;About the Role:&#10;We are looking for a talented...&#10;&#10;Requirements:&#10;• 3+ years experience with React&#10;• Proficiency in Node.js..."
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              id="jd-textarea"
            />
          </div>
          <div className="flex justify-between mb-4" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            <span>{jdText.length} characters</span>
            {jdText && <button onClick={() => { setJdText(''); setAnalysis(null); }} style={{ color: 'var(--danger-light)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Clear</button>}
          </div>
          <button className="btn btn-primary btn-lg w-full" onClick={handleAnalyze} disabled={loading || !jdText.trim()} id="analyze-jd-btn">
            {loading ? <><div className="spinner" /> Analyzing...</> : <><Briefcase size={16} /> Analyze Job Description</>}
          </button>

          {analysis && (
            <div className="card mt-4" style={{ padding: '1rem' }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ width: 40, height: 40, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  💼
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{analysis.jobTitle || 'Role'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{analysis.company || 'Company'} · {analysis.seniorityLevel}</div>
                </div>
                <span className="badge badge-secondary" style={{ marginLeft: 'auto' }}>{analysis.experienceRequired}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>{analysis.summary}</p>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div>
          {!analysis && !loading && (
            <div className="card text-center" style={{ padding: '4rem 2rem', opacity: 0.6 }}>
              <Briefcase size={48} style={{ margin: '0 auto 1rem', color: 'var(--muted)' }} />
              <p style={{ color: 'var(--muted)' }}>JD analysis will appear here</p>
            </div>
          )}

          {loading && (
            <div className="card text-center" style={{ padding: '4rem 2rem' }}>
              <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto 1.5rem' }} />
              <p style={{ fontWeight: 600 }}>Analyzing job description...</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="animate-fade-up">
              <div className="tabs mb-4">
                {['overview', 'skills', 'responsibilities', 'prep'].map(t => (
                  <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} id={`jd-tab-${t}`}>
                    {t === 'prep' ? 'Interview Prep' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="card">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.keywords?.slice(0, 12).map((kw, i) => (
                      <span key={i} className="chip chip-primary" style={{ fontSize: '0.75rem' }}>
                        <Tag size={9} />{kw}
                      </span>
                    ))}
                  </div>
                  {analysis.softSkills?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Soft Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.softSkills.map((sk, i) => <span key={i} className="chip">{sk}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="card">
                  {[
                    { label: 'Required Skills', items: analysis.requiredSkills, color: 'var(--danger)' },
                    { label: 'Preferred Skills', items: analysis.preferredSkills, color: 'var(--warning)' },
                    { label: 'Languages', items: analysis.programmingLanguages, color: 'var(--primary-light)' },
                    { label: 'Frameworks', items: analysis.frameworks, color: 'var(--secondary-light)' },
                    { label: 'Tools', items: analysis.tools, color: 'var(--success)' },
                  ].filter(g => g.items?.length).map((group, gi) => (
                    <div key={gi} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>{group.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((sk, i) => (
                          <span key={i} className="chip" style={{ borderColor: group.color + '40', color: group.color, background: group.color + '10' }}>{sk}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'responsibilities' && (
                <div className="card">
                  {analysis.responsibilities?.map((r, i) => (
                    <div key={i} className="flex gap-3" style={{ marginBottom: '0.875rem', fontSize: '0.875rem' }}>
                      <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.15rem' }} />
                      <span style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r}</span>
                    </div>
                  ))}
                  {analysis.educationRequired && (
                    <div className="mt-4 p-3" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Education Requirement</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '0.25rem' }}>{analysis.educationRequired}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'prep' && (
                <div className="card">
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>Likely interview topics based on this JD:</p>
                  {analysis.interviewTopics?.map((topic, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '0.75rem', marginBottom: '0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <div style={{ width: '1.5rem', height: '1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{topic}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
