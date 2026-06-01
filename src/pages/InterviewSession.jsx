import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInterview, updateInterview, saveAnswer, saveEvaluation, addXP, updateUserProfile } from '../firebase/firestore';
import { generateQuestions } from '../ai/questionEngine';
import { evaluateAnswer, calculateReadinessScore } from '../ai/evaluationEngine';
import { useVoice } from '../hooks/useVoice';
import { useTimer } from '../hooks/useTimer';
import { Mic, MicOff, Send, ChevronRight, Volume2, VolumeX, AlertCircle, CheckCircle, Clock, Zap, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';

function TimerRing({ percentage, timeLeft, isDanger, isWarning, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)';
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s', filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', animation: isDanger ? 'timer-warning 1s ease-in-out infinite' : 'none' }}>{timeLeft}s</div>
      </div>
    </div>
  );
}

export default function InterviewSession() {
  const { id } = useParams();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const voice = useVoice();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [phase, setPhase] = useState('loading'); // loading | question | evaluating | result | done
  const [voiceMode, setVoiceMode] = useState(false);
  const [currentEval, setCurrentEval] = useState(null);
  const [scores, setScores] = useState([]);
  const timer = useTimer(interview?.difficulty || 'Medium');
  const answerRef = useRef('');

  useEffect(() => {
    if (!id) return;
    getInterview(id).then(async (iv) => {
      if (!iv) { toast.error('Interview not found'); navigate('/dashboard'); return; }
      setInterview(iv);
      // Generate questions
      const qs = await generateQuestions({
        type: iv.type, difficulty: iv.difficulty, count: iv.count,
        resumeSummary: iv.resumeSummary, jdSummary: iv.jdSummary,
      });
      setQuestions(qs);
      setPhase('question');
    }).catch(() => { toast.error('Failed to load interview'); navigate('/dashboard'); });
  }, [id]);

  useEffect(() => {
    if (phase === 'question' && questions[currentIdx]) {
      timer.start();
      answerRef.current = '';
      setAnswer('');
      setCurrentEval(null);
      if (voiceMode) voice.speak(questions[currentIdx].question);
    }
  }, [phase, currentIdx, questions.length]);

  useEffect(() => {
    if (timer.isExpired && phase === 'question') handleSubmit(true);
  }, [timer.isExpired]);

  const handleVoiceResult = (text) => {
    answerRef.current = answerRef.current + ' ' + text;
    setAnswer(answerRef.current.trim());
  };

  const toggleVoice = () => {
    if (voice.isListening) { voice.stopListening(); }
    else { voice.startListening(handleVoiceResult); }
  };

  const handleSubmit = async (timedOut = false) => {
    if (phase !== 'question') return;
    timer.stop();
    if (voiceMode) voice.stopListening();
    setPhase('evaluating');

    const q = questions[currentIdx];
    const userAnswer = answer.trim() || (timedOut ? '[No answer - time expired]' : '');

    try {
      const ev = await evaluateAnswer({
        question: q.question,
        answer: userAnswer,
        expectedKeyPoints: q.expectedKeyPoints || [],
        type: interview.type,
        difficulty: interview.difficulty,
        timeTaken: timer.timeTaken,
        timeLimit: timer.totalTime,
      });

      const penalty = timer.getTimePenalty();
      const adjustedScore = Math.max(0, (ev.scores?.total || 0) - penalty);
      const finalEv = { ...ev, scores: { ...ev.scores, total: adjustedScore }, timeTaken: timer.timeTaken, timedOut, penaltyApplied: penalty };

      setCurrentEval(finalEv);
      setEvaluations(prev => [...prev, finalEv]);
      setScores(prev => [...prev, adjustedScore]);

      // Save to Firestore
      if (user) {
        await saveAnswer({ uid: user.uid, interviewId: id, questionId: q.id, question: q.question, answer: userAnswer, timeTaken: timer.timeTaken, ...finalEv });
      }
      setPhase('result');
    } catch (err) {
      toast.error('Evaluation failed. Skipping question.');
      console.error(err);
      goNext();
    }
  };

  const goNext = () => {
    const next = currentIdx + 1;
    if (next >= questions.length) {
      finishInterview();
    } else {
      setCurrentIdx(next);
      setPhase('question');
    }
  };

  const finishInterview = async () => {
    setPhase('done');
    const allScores = [...scores];
    const readiness = calculateReadinessScore(evaluations);
    const finalScore = allScores.length ? Math.round(allScores.reduce((a,b)=>a+b,0)/allScores.length) : 0;

    if (user) {
      await updateInterview(id, { status: 'completed', finalScore, readinessScore: readiness, scores: allScores });
      await updateUserProfile(user.uid, {
        readinessScore: readiness,
        totalInterviews: (profile?.totalInterviews || 0) + 1,
      });
      await addXP(user.uid, Math.round(finalScore / 2));
      await refreshProfile();
    }
    toast.success(`Interview complete! Score: ${finalScore}/100 🎉`);
    setTimeout(() => navigate(`/interview/${id}/replay`), 1500);
  };

  if (phase === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="spinner spinner-lg spinner-primary" />
      <p style={{ color: 'var(--muted)' }}>Generating your personalized questions...</p>
    </div>
  );

  const q = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;
  const avgScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;

  if (phase === 'done') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontSize: '4rem' }}>🎉</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Interview Complete!</h2>
      <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--success)' }}>{avgScore}<span style={{ fontSize: '1.5rem' }}>/100</span></div>
      <p style={{ color: 'var(--muted)' }}>Generating your detailed report...</p>
      <div className="spinner spinner-primary" />
    </div>
  );

  return (
    <div className="interview-room" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="interview-header">
        <div className="flex items-center gap-4">
          <div className="sidebar-logo-mark" style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{interview?.type} Interview</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{interview?.difficulty} · Q{currentIdx + 1} of {questions.length}</div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="interview-progress-track">
          {questions.map((_, i) => (
            <div key={i} className={`interview-progress-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`} />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {scores.length > 0 && (
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)' }}>
              Avg: {avgScore}/100
            </div>
          )}
          <span className={`badge ${interview?.difficulty === 'Easy' ? 'badge-success' : interview?.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
            {interview?.difficulty}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 3, background: 'var(--surface-2)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,var(--primary),var(--secondary))', transition: 'width 0.5s ease' }} />
      </div>

      {/* Body */}
      <div className="interview-body">
        {/* Main */}
        <div className="interview-main">
          {phase === 'question' && q && (
            <div className="animate-fade-up">
              {/* Question Card */}
              <div className="card" style={{ border: '1px solid rgba(124,58,237,0.25)', boxShadow: '0 0 30px var(--primary-glow)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-ghost" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Q{currentIdx + 1}</span>
                    <span className="badge badge-primary">{q.category}</span>
                  </div>
                  <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success diff-easy' : q.difficulty === 'Medium' ? 'badge-warning diff-medium' : 'badge-danger diff-hard'}`}>
                    {q.difficulty}
                  </span>
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.6, color: 'var(--text)', marginBottom: '0.5rem' }}>{q.question}</p>
                {q.followUp && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>Follow-up: {q.followUp}</p>
                )}
              </div>

              {/* Answer Input */}
              <div className="card" style={{ marginTop: '1rem' }}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Your Answer</span>
                  <div className="flex items-center gap-2">
                    {voiceMode && voice.isListening && (
                      <div className="waveform">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className="waveform-bar" style={{ height: `${Math.random() * 20 + 6}px` }} />
                        ))}
                      </div>
                    )}
                    {voice.supported && (
                      <button
                        className={`btn btn-sm ${voice.isListening ? 'btn-danger' : voiceMode ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => { setVoiceMode(!voiceMode); if (!voiceMode) toggleVoice(); else voice.stopListening(); }}
                        id="voice-toggle-btn"
                      >
                        {voice.isListening ? <MicOff size={14} /> : <Mic size={14} />}
                        {voice.isListening ? 'Stop' : voiceMode ? 'Voice On' : 'Use Voice'}
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  className="input"
                  style={{ minHeight: 160, resize: 'vertical', fontSize: '0.9rem', lineHeight: 1.7 }}
                  placeholder="Type your answer here, or use voice mode to speak your response..."
                  value={answer}
                  onChange={e => { setAnswer(e.target.value); answerRef.current = e.target.value; }}
                  id="answer-textarea"
                />
                <div className="flex justify-between items-center mt-3">
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{answer.length} chars</span>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => goNext()} id="skip-btn">
                      <SkipForward size={14} /> Skip
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={!answer.trim()} id="submit-answer-btn">
                      <Send size={14} /> Submit Answer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === 'evaluating' && (
            <div className="card text-center animate-fade-up" style={{ padding: '4rem' }}>
              <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto 1.5rem' }} />
              <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>AI is evaluating your answer...</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Analyzing accuracy, relevance, depth, communication, and time efficiency</p>
            </div>
          )}

          {phase === 'result' && currentEval && (
            <div className="animate-fade-up">
              {/* Score Breakdown */}
              <div className="card" style={{ border: `1px solid ${currentEval.scores.total >= 70 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, marginBottom: '1rem' }}>
                <div className="flex items-center justify-between mb-4">
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>Answer Evaluation</div>
                  <div style={{
                    fontWeight: 900, fontSize: '2rem', fontFamily: 'var(--font-display)',
                    color: currentEval.scores.total >= 80 ? 'var(--success)' : currentEval.scores.total >= 60 ? 'var(--warning)' : 'var(--danger)',
                  }}>{currentEval.scores.total}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--muted)' }}>/100</span></div>
                </div>

                {/* Score Bars */}
                {[
                  { label: 'Accuracy', val: currentEval.scores.accuracy, max: 30 },
                  { label: 'Relevance', val: currentEval.scores.relevance, max: 25 },
                  { label: 'Depth', val: currentEval.scores.depth, max: 20 },
                  { label: 'Communication', val: currentEval.scores.communication, max: 15 },
                  { label: 'Time Efficiency', val: currentEval.scores.timeEfficiency, max: 10 },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', minWidth: 110 }}>{s.label}</span>
                    <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(s.val / s.max) * 100}%`, background: 'linear-gradient(90deg,var(--primary),var(--secondary-light))', borderRadius: '999px', transition: 'width 1s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: 35, textAlign: 'right' }}>{s.val}/{s.max}</span>
                  </div>
                ))}

                <div className="divider" />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>{currentEval.feedback}</p>

                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ Strengths</div>
                    {currentEval.strengths?.map((s, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>• {s}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚠ Improve</div>
                    {currentEval.suggestions?.slice(0, 2).map((s, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>• {s}</div>)}
                  </div>
                </div>

                {currentEval.timedOut && (
                  <div className="flex items-center gap-2 mt-3" style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--danger-light)' }}>
                    <AlertCircle size={14} /> Time expired — penalty applied to Time Efficiency score
                  </div>
                )}
              </div>

              <button className="btn btn-primary btn-lg w-full" onClick={goNext} id="next-question-btn">
                {currentIdx + 1 >= questions.length ? 'Finish Interview 🎉' : <>Next Question <ChevronRight size={16} /></>}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Panel */}
        <div className="interview-sidebar-panel">
          {/* Timer */}
          <div className="card text-center" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Time Remaining</div>
            <TimerRing
              percentage={timer.percentage}
              timeLeft={timer.timeLeft}
              isDanger={timer.isDanger}
              isWarning={timer.isWarning}
              size={120}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
              {timer.totalTime}s limit · {interview?.difficulty}
            </div>
          </div>

          {/* Score History */}
          {scores.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Score History</div>
              {scores.map((s, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', minWidth: '1.5rem' }}>Q{i + 1}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s}%`, background: s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--warning)' : 'var(--danger)', borderRadius: '999px' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--warning)' : 'var(--danger)', minWidth: '2rem', textAlign: 'right' }}>{s}</span>
                </div>
              ))}
              <div className="divider" style={{ margin: '0.75rem 0' }} />
              <div className="flex justify-between" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--muted)' }}>Average</span>
                <span style={{ color: 'var(--primary-light)' }}>{avgScore}/100</span>
              </div>
            </div>
          )}

          {/* AI Tip */}
          {phase === 'question' && q && (
            <div className="card" style={{ padding: '1rem', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>💡 Tip</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>Cover: {q.expectedKeyPoints?.slice(0, 2).join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
