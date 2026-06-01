import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../firebase/firestore';
import { logOut } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Mic, Shield, LogOut, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName });
      await refreshProfile();
      toast.success('Settings saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const Toggle = ({ value, onChange, id }) => (
    <button onClick={() => onChange(!value)} id={id}
      style={{ width: 44, height: 24, background: value ? 'var(--primary)' : 'var(--surface-3)', borderRadius: '999px', border: 'none', cursor: 'pointer', transition: 'background 0.2s', position: 'relative' }}>
      <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );

  return (
    <div className="page-container" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="mb-8">
        <div className="section-eyebrow">Preferences</div>
        <h1 className="section-title">Account <span className="gradient-text">Settings</span></h1>
      </div>

      {/* Profile */}
      <div className="card mb-4">
        <div style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} style={{ color: 'var(--primary-light)' }} /> Profile
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', color: 'white', flexShrink: 0, overflow: 'hidden' }}>
            {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.displayName || 'U').slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{user?.displayName || 'User'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{user?.email}</div>
          </div>
        </div>
        <div className="input-group mb-4">
          <label className="input-label">Display Name</label>
          <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} id="settings-name" placeholder="Your name" />
        </div>
        <div className="input-group mb-4">
          <label className="input-label">Email</label>
          <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-settings-btn">
          {saving ? <><div className="spinner" /> Saving...</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Notifications */}
      <div className="card mb-4">
        <div style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={16} style={{ color: 'var(--warning)' }} /> Notifications
        </div>
        {[
          { label: 'Daily practice reminders', desc: 'Get notified to maintain your streak', value: notifications, onChange: setNotifications, id: 'notif-daily' },
        ].map(item => (
          <div key={item.id} className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{item.desc}</div>
            </div>
            <Toggle value={item.value} onChange={item.onChange} id={item.id} />
          </div>
        ))}
      </div>

      {/* Voice */}
      <div className="card mb-4">
        <div style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mic size={16} style={{ color: 'var(--success)' }} /> Voice Mode
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Enable Voice Mode</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Use speech-to-text and text-to-speech in interviews</div>
          </div>
          <Toggle value={voiceEnabled} onChange={setVoiceEnabled} id="voice-toggle-settings" />
        </div>
      </div>

      {/* Account */}
      <div className="card mb-4">
        <div style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} style={{ color: 'var(--danger-light)' }} /> Account
        </div>
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
          Level {profile?.level || 1} · {profile?.xp || 0} XP · {profile?.totalInterviews || 0} interviews completed
        </div>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ color: 'var(--danger-light)', borderColor: 'rgba(239,68,68,0.2)' }} id="settings-logout-btn">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
