import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, PlayCircle, ChevronDown, Star, Check, Zap, Brain, Target, TrendingUp, Shield, Award } from 'lucide-react';

const FEATURES = [
  { icon: '🧠', title: 'Adaptive AI Engine', desc: 'Questions dynamically adjust in difficulty based on your live performance in real-time.', color: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
  { icon: '🎯', title: 'Resume-JD Matching', desc: 'Upload your resume, paste the JD, and get a detailed skill gap analysis with match scores.', color: 'rgba(37,99,235,0.15)', border: 'rgba(37,99,235,0.3)' },
  { icon: '🎙️', title: 'Voice Mode', desc: 'Answer questions hands-free. AI reads questions aloud and transcribes your spoken answers.', color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  { icon: '📊', title: 'Deep Analytics', desc: 'Radar charts, skill heatmaps, readiness trends and hiring probability across all interviews.', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  { icon: '🏆', title: 'Gamification', desc: 'Earn XP, level up, unlock achievements and compete on the global leaderboard.', color: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
  { icon: '📄', title: 'PDF Reports', desc: 'Download a professional interview report with scores, feedback and a learning roadmap.', color: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
];

const STEPS = [
  { num: '01', title: 'Upload Resume & JD', desc: 'Upload your resume and paste the job description for AI-powered context.' },
  { num: '02', title: 'Configure Interview', desc: 'Choose type, difficulty, and question count. AI personalizes everything.' },
  { num: '03', title: 'Live AI Interview', desc: 'Answer adaptive questions by text or voice. Timer tracks your response speed.' },
  { num: '04', title: 'Get Instant Feedback', desc: 'Receive detailed evaluation, scores, and an improvement roadmap.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'SWE @ Google', rating: 5, text: 'InterviewIQ AI helped me crack Google in 3 weeks. The adaptive difficulty engine is unlike anything I\'ve used before. My readiness score went from 52 to 91!' },
  { name: 'Marcus Johnson', role: 'Senior Dev @ Meta', rating: 5, text: 'The resume-JD match feature revealed skill gaps I never knew I had. Practiced 15 mock interviews, got 3 offers. Absolutely worth it.' },
  { name: 'Sarah Chen', role: 'PM @ Stripe', rating: 5, text: 'The behavioral interview mode is phenomenal. The AI asks follow-up questions just like a real interviewer. Felt completely prepared on interview day.' },
  { name: 'Arjun Patel', role: 'ML Engineer @ OpenAI', rating: 5, text: 'Voice mode changed everything. Being able to practice speaking answers out loud while getting transcribed feedback is a game changer for technical interviews.' },
  { name: 'Emily Rodriguez', role: 'Fullstack Dev @ Shopify', rating: 5, text: 'The PDF report I downloaded before my interview was incredible. It had exactly what I needed to focus on. My hiring manager was impressed.' },
  { name: 'David Kim', role: 'DevOps @ Cloudflare', rating: 5, text: 'Went from never making it past the first round to getting 4 offers in 6 weeks. The readiness score system keeps you honest and motivated.' },
];

const FAQS = [
  { q: 'How does the adaptive difficulty work?', a: 'Our AI engine tracks your score in real-time. If you score above 80, difficulty increases to challenge you. Between 50-80, it maintains level. Below 50, it reduces to build your confidence and fundamentals.' },
  { q: 'What interview types are supported?', a: 'Technical (algorithms, system design), Behavioral (STAR method), HR (culture fit, salary), Scenario-Based (real-world situations), and Project Discussion (deep-dive into your work).' },
  { q: 'Is voice mode available on all browsers?', a: 'Voice mode works best on Chrome and Edge using the Web Speech API. Firefox has limited support. No external API or subscription is needed — it uses your browser\'s built-in capabilities.' },
  { q: 'How is the readiness score calculated?', a: 'Your readiness score is a weighted average across all your interviews: Accuracy (30%), Relevance (25%), Depth (20%), Communication (15%), and Time Efficiency (10%). It updates after every session.' },
  { q: 'Can recruiters view my profile?', a: 'Yes! The Recruiter View allows hiring managers to browse candidate profiles, compare readiness scores, and view detailed interview analytics — with your permission.' },
  { q: 'Is the AI really generating questions in real-time?', a: 'Yes. Every question is generated live by Gemini AI, personalized to your resume, the job description, your performance so far, and the selected interview type and difficulty.' },
];

function CountUp({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <div className="faq-question" onClick={() => setOpen(!open)} id={`faq-${q.slice(0,20).replace(/\s/g,'-')}`}>
        <span>{q}</span>
        <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', color: 'var(--muted)', flexShrink: 0 }} />
      </div>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav" style={{ boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none' }}>
        <div className="flex items-center gap-3">
          <div className="sidebar-logo-mark" style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>⚡</div>
          <span className="sidebar-logo-text" style={{ fontSize: '1.1rem' }}>InterviewIQ AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="btn btn-ghost btn-sm" id="nav-signin">Sign In</Link>
          <Link to="/auth?tab=signup" className="btn btn-primary btn-sm" id="nav-signup">Get Started Free</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <Zap size={12} />
            Powered by Gemini AI · Trusted by 50,000+ candidates
          </div>
          <h1 className="hero-headline">
            Ace Every Interview<br />
            <span className="gradient-text">with AI</span>
          </h1>
          <p className="hero-subheadline">
            Practice realistic interviews, receive expert feedback, and discover exactly when you're ready to get hired.
          </p>
          <div className="hero-cta">
            <Link to="/auth?tab=signup" className="btn btn-primary btn-xl animate-pulse-ring" id="hero-start-btn">
              <PlayCircle size={20} />
              Start Interview
            </Link>
            <a href="#how-it-works" className="btn btn-glass btn-xl" id="hero-demo-btn">
              <Play size={18} />
              Watch Demo
            </a>
          </div>
          <div className="hero-stats">
            <div className="text-center">
              <div className="hero-stat-value gradient-text"><CountUp end={50000} suffix="+" /></div>
              <div className="hero-stat-label">Interviews Practiced</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="text-center">
              <div className="hero-stat-value gradient-text"><CountUp end={92} suffix="%" /></div>
              <div className="hero-stat-label">Offer Rate Improvement</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="text-center">
              <div className="hero-stat-value gradient-text"><CountUp end={15000} suffix="+" /></div>
              <div className="hero-stat-label">Offers Received</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section id="how-it-works" className="landing-section-full">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="text-center mb-8">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>How It Works</div>
            <h2 className="section-title">From Zero to <span className="gradient-text">Offer Ready</span></h2>
            <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>Four simple steps powered by AI intelligence</p>
          </div>
          <div className="steps-container" style={{ flexWrap: 'wrap', gap: '2rem' }}>
            {STEPS.map((step, i) => (
              <div key={i} className="step-item" style={{ minWidth: 200 }}>
                <div className="step-number">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="landing-section">
        <div className="text-center mb-8">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Platform Features</div>
          <h2 className="section-title">Everything You Need to <span className="gradient-text">Get Hired</span></h2>
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>A complete interview preparation ecosystem — not just another quiz app.</p>
        </div>
        <div className="grid grid-3" style={{ gap: '1.25rem' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="feature-icon" style={{ background: f.color, border: `1px solid ${f.border}` }}>
                <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Interview Flow ────────────────────────────── */}
      <section className="landing-section-full">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="text-center mb-8">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>AI Interview Flow</div>
            <h2 className="section-title">Smarter Than Any <span className="gradient-text">Prep Platform</span></h2>
          </div>
          <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'center' }}>
            <div>
              {[
                { icon: Brain, title: 'Real-Time Adaptation', desc: 'AI monitors every answer. Score drops → easier questions. Score rises → harder questions. Always in your growth zone.' },
                { icon: Target, title: 'Context-Aware Questions', desc: 'Questions generated from your actual resume and the specific job description. 100% personalized.' },
                { icon: TrendingUp, title: '5-Dimension Scoring', desc: 'Accuracy, Relevance, Depth, Communication, and Time Efficiency — every answer scored on all 5 axes.' },
                { icon: Shield, title: 'Expert Feedback', desc: 'Detailed AI feedback on every answer with strengths, weaknesses, and a model answer to compare against.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={16} style={{ color: 'var(--primary-light)' }} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Difficulty progression visual */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Difficulty Progression</div>
              {[
                { q: 'Q1', score: 72, diff: 'Medium', color: 'var(--warning)' },
                { q: 'Q2', score: 84, diff: 'Medium → Hard', color: 'var(--warning)' },
                { q: 'Q3', score: 91, diff: 'Hard', color: 'var(--danger)' },
                { q: 'Q4', score: 78, diff: 'Hard', color: 'var(--danger)' },
                { q: 'Q5', score: 88, diff: 'Hard', color: 'var(--danger)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.875rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', minWidth: '1.5rem', color: 'var(--muted)' }}>{item.q}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.score}%`, background: `linear-gradient(90deg, var(--primary), var(--secondary-light))`, borderRadius: '999px', transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', minWidth: '2.5rem', color: 'var(--text)' }}>{item.score}</span>
                  <span style={{ fontSize: '0.7rem', color: item.color, fontWeight: 600, minWidth: 80 }}>{item.diff}</span>
                </div>
              ))}
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--success)' }}>
                <Award size={14} />
                <strong>Readiness Score: 83/100</strong> — Strong Candidate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Success Metrics ──────────────────────────────── */}
      <section className="landing-section">
        <div className="text-center mb-8">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Results That Speak</div>
          <h2 className="section-title">Real Impact, <span className="gradient-text">Proven Results</span></h2>
        </div>
        <div className="grid grid-4" style={{ gap: '1.25rem' }}>
          {[
            { value: 92, suffix: '%', label: 'Users report improved confidence', icon: '🚀' },
            { value: 3, suffix: 'x', label: 'More likely to pass first round', icon: '🎯' },
            { value: 21, suffix: ' days', label: 'Average time to first offer', icon: '⚡' },
            { value: 4.9, suffix: '/5', label: 'Average user satisfaction', icon: '⭐' },
          ].map((m, i) => (
            <div key={i} className="card text-center" style={{ padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{m.icon}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                <CountUp end={m.value * (m.suffix === '/5' ? 10 : 1)} suffix={m.suffix} />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="landing-section-full">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="text-center mb-8">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Testimonials</div>
            <h2 className="section-title">Loved by <span className="gradient-text">Thousands</span></h2>
          </div>
          <div className="grid grid-3" style={{ gap: '1.25rem' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.slice(0, 2)}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="landing-section">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="text-center mb-8">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>FAQ</div>
            <h2 className="section-title">Common <span className="gradient-text">Questions</span></h2>
          </div>
          {FAQS.map((faq, i) => <FAQ key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="landing-section-full" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="section-title" style={{ fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: '1rem' }}>
            Ready to <span className="gradient-text">Ace Your Interview?</span>
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Join 50,000+ candidates who use InterviewIQ AI to land their dream jobs. Free to start — no credit card required.
          </p>
          <div className="flex gap-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth?tab=signup" className="btn btn-primary btn-xl" id="cta-signup-btn">
              Start Free Today
              <ArrowRight size={18} />
            </Link>
            <Link to="/auth" className="btn btn-ghost btn-xl" id="cta-signin-btn">Sign In</Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            {['No credit card required', 'Free forever plan', 'Cancel anytime'].map(t => (
              <div key={t} className="flex items-center gap-1">
                <Check size={12} style={{ color: 'var(--success)' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-2">
          <div className="sidebar-logo-mark" style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InterviewIQ AI</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          © 2026 InterviewIQ AI. Built for hackathon excellence. All rights reserved.
        </div>
        <div className="flex gap-4" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color=''}>Privacy</a>
          <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color=''}>Terms</a>
          <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color=''}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
