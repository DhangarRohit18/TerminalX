import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeResume } from '../ai/resumeAnalyzer';
import { analyzeJD } from '../ai/jdAnalyzer';
import { matchResumeToJD } from '../ai/matchEngine';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { GitCompare, CheckCircle, XCircle, AlertTriangle, TrendingUp, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function ScoreArc({ value, label, color }) {
  const r = 60;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={140} height={80} viewBox="0 0 140 80">
        <path d={`M 10 75 A 60 60 0 0 1 130 75`} fill="none" stroke="var(--surface-2)" strokeWidth={10} strokeLinecap="round" />
        <path d={`M 10 75 A 60 60 0 0 1 130 75`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={`${(value / 100) * (Math.PI * r)} ${Math.PI * r}`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        <text x="70" y="70" textAnchor="middle" fill="white" fontSize="20" fontWeight="800" fontFamily="Outfit">{value}</text>
      </svg>
      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function MatchEngine() {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!resumeText.trim() || !jdText.trim()) { toast.error('Please provide both resume and job description'); return; }
    setLoading(true);
    try {
      const [resumeAnalysis, jdAnalysis] = await Promise.all([analyzeResume(resumeText), analyzeJD(jdText)]);
      const result = await matchResumeToJD(resumeAnalysis, jdAnalysis);
      setMatchData({ ...result, resumeAnalysis, jdAnalysis });
      toast.success('Match analysis complete!');
    } catch (err) {
      toast.error('Match failed. Please try again.');
      console.error(err);
    } finally { setLoading(false); }
  };

  const recColor = matchData?.recommendation === 'hire' ? 'var(--success)' : matchData?.recommendation === 'maybe' ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="section-eyebrow">Match Engine</div>
        <h1 className="section-title">Resume × JD <span className="gradient-text">Match</span></h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Compare your resume against a job description to find skill gaps and your overall match score.</p>
      </div>

      {/* Input Row */}
      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="input-group">
          <label className="input-label">Your Resume</label>
          <textarea className="input" style={{ minHeight: 200, fontSize: '0.82rem' }} placeholder="Paste your resume text..." value={resumeText} onChange={e => setResumeText(e.target.value)} id="match-resume-input" />
        </div>
        <div className="input-group">
          <label className="input-label">Job Description</label>
          <textarea className="input" style={{ minHeight: 200, fontSize: '0.82rem' }} placeholder="Paste the job description..." value={jdText} onChange={e => setJdText(e.target.value)} id="match-jd-input" />
        </div>
      </div>

      <button className="btn btn-primary btn-lg" style={{ width: '100%', maxWidth: 320, margin: '0 auto', display: 'flex' }} onClick={handleMatch} disabled={loading} id="run-match-btn">
        {loading ? <><div className="spinner" /> Analyzing Match...</> : <><GitCompare size={16} /> Run Match Analysis</>}
      </button>

      {loading && (
        <div className="card text-center mt-8" style={{ padding: '4rem' }}>
          <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto 1.5rem' }} />
          <p style={{ fontWeight: 600 }}>Running AI match analysis...</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Analyzing both documents simultaneously</p>
        </div>
      )}

      {matchData && !loading && (
        <div className="animate-fade-up mt-8">
          {/* Score Arcs */}
          <div className="card mb-6" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Match Score Breakdown</h3>
            <div className="flex justify-center gap-8 flex-wrap">
              <ScoreArc value={matchData.skillMatchPercent || 0} label="Skill Match" color="var(--primary-light)" />
              <ScoreArc value={matchData.projectMatchPercent || 0} label="Project Match" color="var(--secondary-light)" />
              <ScoreArc value={matchData.experienceMatchPercent || 0} label="Experience Match" color="var(--success)" />
              <div style={{ textAlign: 'center' }}>
                <svg width={140} height={80} viewBox="0 0 140 80">
                  <path d={`M 10 75 A 60 60 0 0 1 130 75`} fill="none" stroke="var(--surface-2)" strokeWidth={12} strokeLinecap="round" />
                  <path d={`M 10 75 A 60 60 0 0 1 130 75`} fill="none" stroke="#F59E0B" strokeWidth={12} strokeLinecap="round"
                    strokeDasharray={`${(matchData.overallMatchScore / 100) * (Math.PI * 60)} ${Math.PI * 60}`}
                    style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} />
                  <text x="70" y="70" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="Outfit">{matchData.overallMatchScore}</text>
                </svg>
                <div style={{ fontSize: '0.78rem', color: 'var(--warning)', marginTop: '0.25rem', fontWeight: 700 }}>Overall Match</div>
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Matched Skills */}
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Matched Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {matchData.matchedSkills?.map((sk, i) => (
                  <span key={i} className="chip" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', color: 'var(--success)' }}>{sk}</span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={16} style={{ color: 'var(--danger)' }} /> Missing Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {matchData.missingSkills?.map((sk, i) => (
                  <span key={i} className="chip" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', color: 'var(--danger-light)' }}>{sk}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Breakdown Table */}
          {matchData.skillBreakdown?.length > 0 && (
            <div className="card mb-6">
              <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} style={{ color: 'var(--primary-light)' }} /> Skill Proficiency Breakdown
              </div>
              {matchData.skillBreakdown.slice(0, 10).map((sk, i) => (
                <div key={i} className="skill-matrix-row">
                  <span className="skill-name">{sk.skill}</span>
                  <div className="skill-bar-wrapper">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${sk.proficiencyEstimate || 0}%`,
                        background: sk.inResume && sk.inJD ? 'linear-gradient(90deg,var(--success),var(--success-light))'
                          : sk.inJD ? 'linear-gradient(90deg,var(--danger),var(--danger-light))'
                          : 'linear-gradient(90deg,var(--surface-3),var(--muted-2))',
                      }} />
                    </div>
                  </div>
                  <span className="skill-pct" style={{ color: sk.inResume && sk.inJD ? 'var(--success)' : sk.inJD ? 'var(--danger-light)' : 'var(--muted)' }}>
                    {sk.proficiencyEstimate || 0}%
                  </span>
                  <span className="badge" style={{ fontSize: '0.65rem' }}>
                    {sk.inResume && sk.inJD ? <CheckCircle size={10} style={{ color: 'var(--success)' }} /> : <XCircle size={10} style={{ color: 'var(--danger-light)' }} />}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Recommendation */}
          <div className="card" style={{ borderColor: recColor + '40', background: recColor + '06' }}>
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={20} style={{ color: recColor }} />
              <span style={{ fontWeight: 700, color: recColor, textTransform: 'capitalize' }}>
                Recommendation: {matchData.recommendation?.replace('_', ' ')}
              </span>
              <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: '1.1rem', color: recColor }}>
                {matchData.hiringProbability}% Hire Probability
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{matchData.recommendationReason}</p>
            {matchData.improvementPriority?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Priority Improvements</div>
                <div className="flex flex-wrap gap-2">
                  {matchData.improvementPriority.map((p, i) => (
                    <span key={i} className="badge badge-warning">{i + 1}. {p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
