import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, resetPassword } from '../firebase/auth';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Auth() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'signup' ? 'signup' : 'signin');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome to InterviewIQ AI!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally { setLoading(false); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'signup') {
        if (!form.name.trim()) { toast.error('Please enter your name'); setLoading(false); return; }
        await signUpWithEmail(form.email, form.password, form.name);
        toast.success('Account created! Welcome aboard 🎉');
      } else {
        await signInWithEmail(form.email, form.password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' ? 'Incorrect password'
        : err.code === 'auth/user-not-found' ? 'No account found with this email'
        : err.code === 'auth/email-already-in-use' ? 'Email already registered'
        : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters'
        : err.message || 'Authentication failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!form.email) { toast.error('Enter your email first'); return; }
    setLoading(true);
    try {
      await resetPassword(form.email);
      toast.success('Reset email sent! Check your inbox.');
      setTab('signin');
    } catch { toast.error('Failed to send reset email'); }
    finally { setLoading(false); }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    const email = role === 'recruiter' ? 'recruiter@interviewiq.ai' : 'candidate@interviewiq.ai';
    const name = role === 'recruiter' ? 'Demo Recruiter' : 'Demo Candidate';
    const password = 'password123';

    try {
      await signInWithEmail(email, password);
      toast.success(`Welcome back, ${name}!`);
      navigate(role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      // Fallback: create the user if they do not exist
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' ||
        err.message?.includes('user-not-found') ||
        err.message?.includes('INVALID_LOGIN_CREDENTIALS')
      ) {
        try {
          await signUpWithEmail(email, password, name);
          toast.success(`Demo account created! Welcome ${name}.`);
          navigate(role === 'recruiter' ? '/recruiter' : '/dashboard');
        } catch (regErr) {
          toast.error(`Demo registration failed: ${regErr.message}`);
        }
      } else {
        toast.error(`Demo login failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        {/* Back to landing */}
        <Link to="/" className="flex items-center gap-2 mb-6" style={{ fontSize: '0.8rem', color: 'var(--muted)', width: 'fit-content' }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">⚡</div>
          <div className="auth-logo-text">InterviewIQ AI</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
            {tab === 'signin' ? 'Welcome back! Sign in to continue.' :
             tab === 'signup' ? 'Create your account. Free forever.' :
             'Reset your password'}
          </p>
        </div>

        {/* Tabs */}
        {tab !== 'forgot' && (
          <div className="tabs mb-6">
            <button className={`tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => setTab('signin')} id="tab-signin">Sign In</button>
            <button className={`tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')} id="tab-signup">Sign Up</button>
          </div>
        )}

        {/* Google */}
        {tab !== 'forgot' && (
          <>
            <button className="google-btn mb-4" onClick={handleGoogle} disabled={loading} id="google-auth-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <div className="flex gap-3 mb-4">
              <button type="button" className="btn btn-glass flex-1 flex items-center justify-center gap-2" style={{ fontSize: '0.8rem', padding: '0.625rem' }} onClick={() => handleDemoLogin('candidate')} disabled={loading}>
                👤 Candidate Demo
              </button>
              <button type="button" className="btn btn-glass flex-1 flex items-center justify-center gap-2" style={{ fontSize: '0.8rem', padding: '0.625rem' }} onClick={() => handleDemoLogin('recruiter')} disabled={loading}>
                💼 Recruiter Demo
              </button>
            </div>
            <div className="divider-text mb-4">or use credentials</div>
          </>
        )}

        {/* Form */}
        <form onSubmit={tab === 'forgot' ? handleReset : handleEmailAuth}>
          {tab === 'signup' && (
            <div className="input-group mb-4">
              <label className="input-label">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={15} className="input-icon" />
                <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} id="input-name" required />
              </div>
            </div>
          )}

          <div className="input-group mb-4">
            <label className="input-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={15} className="input-icon" />
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} id="input-email" required />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="input-group mb-6">
              <label className="input-label">Password</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} id="input-password" required style={{ paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {tab === 'signin' && (
                <button type="button" onClick={() => setTab('forgot')} style={{ alignSelf: 'flex-end', fontSize: '0.78rem', color: 'var(--primary-light)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem' }}>
                  Forgot password?
                </button>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} id="submit-auth-btn">
            {loading ? <><div className="spinner" />&nbsp;Please wait...</> :
             tab === 'signin' ? 'Sign In' :
             tab === 'signup' ? 'Create Account' : 'Send Reset Email'}
          </button>
        </form>

        {tab === 'forgot' && (
          <button onClick={() => setTab('signin')} className="flex items-center gap-2 mt-4" style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '1rem auto 0', cursor: 'pointer', background: 'none', border: 'none' }}>
            <ArrowLeft size={14} /> Back to sign in
          </button>
        )}

        {tab !== 'forgot' && (
          <p className="text-center mt-6" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')} style={{ color: 'var(--primary-light)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              {tab === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
