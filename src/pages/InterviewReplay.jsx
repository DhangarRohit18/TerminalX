import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInterview, getInterviewAnswers } from '../firebase/firestore';
import { generateInterviewReport } from '../ai/reportEngine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Download, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Clock, Star, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function InterviewReplay() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(0);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getInterview(id), getInterviewAnswers(id)]).then(async ([iv, ans]) => {
      setInterview(iv);
      setAnswers(ans);
      setLoading(false);
    });
  }, [id]);

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      const reportData = report || await generateInterviewReport({
        interview, questions: answers.map(a => ({ question: a.question })),
        answers, evaluations: answers, userProfile: profile,
      });
      setReport(reportData);

      const pdf = new jsPDF();
      const W = pdf.internal.pageSize.getWidth();
      let y = 20;

      // Header
      pdf.setFillColor(18, 18, 21);
      pdf.rect(0, 0, W, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18); pdf.setFont('helvetica', 'bold');
      pdf.text('InterviewIQ AI — Interview Report', 14, 15);
      pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
      pdf.text(`${interview?.type} · ${interview?.difficulty} · ${new Date().toLocaleDateString()}`, 14, 28);
      y = 55;

      // Scores
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(14); pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Summary', 14, y); y += 10;
      pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
      pdf.text(`Overall Score: ${interview?.finalScore || 0}/100`, 14, y); y += 7;
      pdf.text(`Readiness Score: ${interview?.readinessScore || 0}/100`, 14, y); y += 7;
      pdf.text(`Category: ${reportData?.readinessCategory || 'N/A'}`, 14, y); y += 7;
      pdf.text(`Total Questions: ${answers.length}`, 14, y); y += 15;

      // Executive Summary
      pdf.setFontSize(13); pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 14, y); y += 8;
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(reportData?.executiveSummary || '', W - 28);
      pdf.text(summaryLines, 14, y); y += summaryLines.length * 5 + 10;

      // Strengths
      pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(16, 185, 129);
      pdf.text('Top Strengths', 14, y); y += 7;
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(30, 30, 30);
      reportData?.topStrengths?.forEach(s => { pdf.text(`• ${s}`, 18, y); y += 6; });
      y += 5;

      // Weaknesses
      pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(239, 68, 68);
      pdf.text('Critical Weaknesses', 14, y); y += 7;
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(30, 30, 30);
      reportData?.criticalWeaknesses?.forEach(w => { pdf.text(`• ${w}`, 18, y); y += 6; });
      y += 5;

      // Q&A
      if (y > 220) { pdf.addPage(); y = 20; }
      pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(30, 30, 30);
      pdf.text('Question-by-Question Breakdown', 14, y); y += 10;
      answers.slice(0, 6).forEach((ans, i) => {
        if (y > 260) { pdf.addPage(); y = 20; }
        pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
        pdf.text(`Q${i+1}: ${ans.question?.slice(0, 80)}...`, 14, y); y += 6;
        pdf.setFont('helvetica', 'normal'); pdf.setTextColor(80, 80, 80);
        const ansLines = pdf.splitTextToSize(`Answer: ${ans.answer?.slice(0, 120) || 'No answer'}`, W - 28);
        pdf.text(ansLines, 14, y); y += ansLines.length * 4 + 6;
        pdf.setTextColor(30, 30, 30);
      });

      pdf.save(`InterviewIQ-Report-${id}.pdf`);
      toast.success('PDF report downloaded!');
    } catch (err) {
      toast.error('PDF generation failed');
      console.error(err);
    } finally { setGeneratingPDF(false); }
  };

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner spinner-lg spinner-primary" />
      <p style={{ color: 'var(--muted)' }}>Loading interview replay...</p>
    </div>
  );

  if (!interview) return (
    <div className="page-container text-center" style={{ padding: '4rem' }}>
      <AlertCircle size={40} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
      <p>Interview not found.</p>
      <Link to="/dashboard" className="btn btn-primary mt-4">Go to Dashboard</Link>
    </div>
  );

  const chartData = answers.map((a, i) => ({
    name: `Q${i+1}`, score: a.scores?.total || 0, time: a.timeTaken || 0,
  }));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/dashboard" className="flex items-center gap-2 mb-3" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="section-eyebrow">Interview Replay</div>
          <h1 className="section-title">{interview.type} — <span className="gradient-text">{interview.difficulty}</span></h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {answers.length} questions · Final Score: <strong style={{ color: interview.finalScore >= 80 ? 'var(--success)' : interview.finalScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{interview.finalScore || 0}/100</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={generatingPDF} id="download-report-btn">
          {generatingPDF ? <><div className="spinner" /> Generating...</> : <><Download size={16} /> Download PDF</>}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-4 mb-6" style={{ gap: '1rem' }}>
        {[
          { label: 'Final Score', value: `${interview.finalScore || 0}/100`, color: 'var(--primary-light)', icon: Star },
          { label: 'Readiness', value: `${interview.readinessScore || 0}/100`, color: 'var(--success)', icon: CheckCircle },
          { label: 'Questions', value: answers.length, color: 'var(--secondary-light)', icon: CheckCircle },
          { label: 'Avg Time', value: `${Math.round(answers.reduce((s,a)=>s+(a.timeTaken||0),0)/Math.max(1,answers.length))}s`, color: 'var(--warning)', icon: Clock },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.color + '15' }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-2 mb-8" style={{ gap: '1.5rem' }}>
        <div className="chart-card">
          <div className="chart-title"><Star size={16} style={{ color: 'var(--warning)' }} /> Score per Question</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="score" fill="var(--primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <div className="chart-title"><Clock size={16} style={{ color: 'var(--secondary-light)' }} /> Response Time (seconds)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="time" stroke="var(--secondary-light)" strokeWidth={2} dot={{ fill: 'var(--secondary-light)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Interview Timeline</h2>
      <div className="replay-timeline">
        {answers.map((ans, i) => (
          <div key={i} className="replay-item">
            <div className={`replay-dot ${expanded === i ? 'active' : ''}`} />
            <div className="replay-card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === i ? -1 : i)}
                id={`replay-item-${i}`}
              >
                <div className="flex items-center gap-3">
                  <span className="badge badge-ghost" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.7rem' }}>Q{i+1}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>{ans.question?.slice(0, 80)}...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    <Clock size={11} />{ans.timeTaken || 0}s
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: '1rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius)',
                    background: (ans.scores?.total || 0) >= 80 ? 'rgba(16,185,129,0.15)' : (ans.scores?.total || 0) >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: (ans.scores?.total || 0) >= 80 ? 'var(--success)' : (ans.scores?.total || 0) >= 60 ? 'var(--warning)' : 'var(--danger)',
                  }}>{ans.scores?.total || 0}</div>
                  {expanded === i ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
                </div>
              </div>

              {expanded === i && (
                <div className="animate-fade-up" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Full Question</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ans.question}</p>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--secondary-light)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Your Answer</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{ans.answer || 'No answer provided'}"</p>
                  </div>
                  {ans.feedback && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>AI Feedback</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ans.feedback}</p>
                    </div>
                  )}
                  {/* Score breakdown */}
                  {ans.scores && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {[
                        ['Accuracy', ans.scores.accuracy, 30],
                        ['Relevance', ans.scores.relevance, 25],
                        ['Depth', ans.scores.depth, 20],
                        ['Comm.', ans.scores.communication, 15],
                        ['Time', ans.scores.timeEfficiency, 10],
                      ].map(([label, val, max]) => (
                        <div key={label} style={{ textAlign: 'center', padding: '0.5rem 0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', minWidth: 70 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{val || 0}/{max}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <Link to="/interview/setup" className="btn btn-primary" id="replay-retry-btn">
          Start New Interview
        </Link>
        <Link to="/analytics" className="btn btn-ghost" id="replay-analytics-btn">
          View Analytics
        </Link>
      </div>
    </div>
  );
}
