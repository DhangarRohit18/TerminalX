import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { analyzeResume } from '../ai/resumeAnalyzer';
import { saveResume } from '../firebase/firestore';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';

function StrengthMeter({ score }) {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const label = score >= 75 ? 'Strong Resume' : score >= 50 ? 'Average Resume' : 'Needs Work';
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Resume Strength</span>
        <span style={{ fontWeight: 800, color, fontSize: '1.1rem' }}>{score}/100</span>
      </div>
      <div className="progress-bar" style={{ height: 10 }}>
        <div className="progress-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, transition: 'width 1.5s ease' }} />
      </div>
      <div style={{ fontSize: '0.75rem', color, marginTop: '0.5rem', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('upload'); // 'upload' | 'paste'
  const [activeTab, setActiveTab] = useState('overview');

  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0];
    if (!file) return;
    setFileName(file.name);
    // Try to read as text (works for .txt; for PDF, fallback to prompt)
    if (file.type === 'text/plain') {
      const text = await file.text();
      setResumeText(text);
      toast.success('File loaded! Click Analyze Resume.');
    } else {
      // For PDF: use PDF.js or prompt paste
      toast('PDF detected. Please paste your resume text below for best results.', { icon: '📋' });
      setMode('paste');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] }, multiple: false,
  });

  const handleAnalyze = async () => {
    const text = resumeText.trim();
    if (!text || text.length < 50) { toast.error('Please provide resume text (at least 50 characters)'); return; }
    setLoading(true);
    try {
      const result = await analyzeResume(text);
      setAnalysis(result);
      if (user) {
        await saveResume(user.uid, { rawText: text, fileName: fileName || 'Manual Entry', ...result });
      }
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="section-eyebrow">Resume Analysis</div>
        <h1 className="section-title">Resume <span className="gradient-text">Analyzer</span></h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Upload or paste your resume. Get AI-powered skill extraction, strength scoring, and improvement suggestions.</p>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Left: Input */}
        <div>
          <div className="tabs mb-4">
            <button className={`tab ${mode === 'upload' ? 'active' : ''}`} onClick={() => setMode('upload')} id="tab-upload">Upload File</button>
            <button className={`tab ${mode === 'paste' ? 'active' : ''}`} onClick={() => setMode('paste')} id="tab-paste">Paste Text</button>
          </div>

          {mode === 'upload' && (
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} id="resume-dropzone">
              <input {...getInputProps()} />
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              {fileName ? (
                <div>
                  <div className="flex items-center justify-center gap-2" style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <FileText size={16} />{fileName}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Drop another file to replace</p>
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>PDF or TXT files supported · Paste text for best results</p>
                </>
              )}
            </div>
          )}

          <div style={{ marginTop: mode === 'paste' ? 0 : '1rem' }}>
            <div className="input-group">
              <label className="input-label">{mode === 'paste' ? 'Paste Resume Text' : 'Or paste resume text here'}</label>
              <textarea
                className="input"
                style={{ minHeight: 280, fontSize: '0.82rem', fontFamily: 'monospace', lineHeight: 1.7 }}
                placeholder="Paste your full resume text here...&#10;&#10;Example:&#10;John Doe&#10;Software Engineer | john@email.com&#10;&#10;EXPERIENCE&#10;Senior Developer at TechCorp (2022-Present)..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                id="resume-textarea"
              />
            </div>
            <div className="flex justify-between items-center mt-2" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              <span>{resumeText.length} characters</span>
              {resumeText && <button onClick={() => { setResumeText(''); setFileName(''); }} style={{ color: 'var(--danger-light)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Clear</button>}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg w-full mt-4"
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            id="analyze-resume-btn"
          >
            {loading ? <><div className="spinner" /> Analyzing with AI...</> : <><FileText size={16} /> Analyze Resume</>}
          </button>
        </div>

        {/* Right: Results */}
        <div>
          {!analysis && !loading && (
            <div className="card text-center" style={{ padding: '4rem 2rem', opacity: 0.6 }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', color: 'var(--muted)' }} />
              <p style={{ color: 'var(--muted)' }}>Analysis results will appear here</p>
            </div>
          )}

          {loading && (
            <div className="card text-center" style={{ padding: '4rem 2rem' }}>
              <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto 1.5rem' }} />
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Analyzing your resume...</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Extracting skills, experience, and generating insights</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="animate-fade-up">
              {/* Strength Score */}
              <div className="card mb-4">
                <StrengthMeter score={analysis.strengthScore || 0} />
              </div>

              {/* Tabs */}
              <div className="tabs mb-4">
                {['overview', 'skills', 'experience', 'suggestions'].map(t => (
                  <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} id={`result-tab-${t}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="card">
                  {analysis.name && <div className="mb-4"><span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{analysis.name}</span></div>}
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '1rem' }}>{analysis.summary}</p>
                  <div className="flex gap-3 flex-wrap">
                    {analysis.strengths?.map((s, i) => (
                      <div key={i} className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--success)' }}>
                        <CheckCircle size={12} />{s}
                      </div>
                    ))}
                  </div>
                  {analysis.education?.[0] && (
                    <div className="mt-4 p-3" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Education</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{analysis.education[0].degree} — {analysis.education[0].institution}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="card">
                  {[
                    { label: 'Technical Skills', items: analysis.skills },
                    { label: 'Languages', items: analysis.programmingLanguages },
                    { label: 'Frameworks', items: analysis.frameworks },
                    { label: 'Tools', items: analysis.tools },
                    { label: 'Certifications', items: analysis.certifications },
                  ].filter(g => g.items?.length).map((group, gi) => (
                    <div key={gi} className="mb-4">
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{group.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((sk, i) => <span key={i} className="chip chip-primary">{sk}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="card">
                  {analysis.experience?.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: i < analysis.experience.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exp.role}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginBottom: '0.5rem' }}>{exp.company} · {exp.duration}</div>
                      <ul style={{ paddingLeft: '1rem' }}>
                        {exp.highlights?.map((h, j) => <li key={j} style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>{h}</li>)}
                      </ul>
                    </div>
                  ))}
                  {analysis.projects?.map((proj, i) => (
                    <div key={i} style={{ marginBottom: '1rem', padding: '0.875rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{proj.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{proj.description}</div>
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack?.map((t, j) => <span key={j} className="chip" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="card">
                  <div className="mb-4">
                    <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={14} style={{ color: 'var(--warning)' }} /> Weaknesses
                    </div>
                    {analysis.weaknesses?.map((w, i) => (
                      <div key={i} className="flex gap-2 mb-2" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--warning)', flexShrink: 0 }}>•</span>{w}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={14} style={{ color: 'var(--success)' }} /> Improvement Suggestions
                    </div>
                    {analysis.improvementSuggestions?.map((s, i) => (
                      <div key={i} className="flex gap-2 mb-2" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>{s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-ghost btn-sm w-full mt-3" onClick={() => { setAnalysis(null); setResumeText(''); setFileName(''); }} id="reset-resume-btn">
                <RefreshCw size={14} /> Analyze Another Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
