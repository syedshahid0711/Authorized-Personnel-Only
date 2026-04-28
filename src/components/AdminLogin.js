import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertTriangle, X, KeyRound } from 'lucide-react';

// Demo admin credentials
const ADMIN_CREDENTIALS = [
  { id: 'admin', password: 'nexus2024', role: 'Administrator' },
  { id: 'superadmin', password: 'breach@0', role: 'Super Administrator' },
  { id: 'ops_chief', password: 'Alpha#999', role: 'Operations Chief' },
];

const AdminLogin = ({ onSuccess, onClose }) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setVisible(true), 10);
  }, []);

  useEffect(() => {
    let interval;
    if (locked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(t => {
          if (t <= 1) {
            setLocked(false);
            setAttempts(0);
            setError('');
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [locked, lockTimer]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (locked) return;

    const match = ADMIN_CREDENTIALS.find(
      c => c.id === adminId.trim() && c.password === password
    );

    if (match) {
      setError('');
      setVisible(false);
      setTimeout(() => onSuccess(match), 400);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      triggerShake();

      if (newAttempts >= 3) {
        setLocked(true);
        setLockTimer(30);
        setError('Too many failed attempts. Account locked for 30 seconds.');
      } else {
        setError(`Invalid credentials. ${3 - newAttempts} attempt(s) remaining.`);
      }
      setPassword('');
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 350);
  };

  return (
    <div className={`admin-login-overlay ${visible ? 'overlay-visible' : ''}`}>
      <div className={`admin-login-card ${shake ? 'shake' : ''} ${visible ? 'card-visible' : ''}`}>

        {/* Close Button */}
        <button className="admin-close-btn" onClick={handleClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-icon-ring">
            <ShieldCheck size={32} />
          </div>
          <h2>Admin Access</h2>
          <p>Restricted — Authorized Personnel Only</p>
        </div>

        {/* Lock Warning */}
        {locked && (
          <div className="admin-lock-banner">
            <AlertTriangle size={16} />
            <span>Account locked · {lockTimer}s remaining</span>
          </div>
        )}

        {/* Form */}
        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="admin-field">
            <label htmlFor="admin-id">
              <User size={14} /> Admin ID
            </label>
            <input
              id="admin-id"
              type="text"
              placeholder="Enter admin ID"
              value={adminId}
              onChange={e => { setAdminId(e.target.value); setError(''); }}
              disabled={locked}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password">
              <Lock size={14} /> Password
            </label>
            <div className="password-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                disabled={locked}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-error">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={locked || !adminId || !password}
          >
            <KeyRound size={18} />
            Authenticate
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="admin-demo-hint">
          <details>
            <summary><span>Demo Credentials</span></summary>
            <div className="demo-creds-list">
              {ADMIN_CREDENTIALS.map(c => (
                <div key={c.id} className="demo-cred-item" onClick={() => { setAdminId(c.id); setPassword(c.password); setError(''); }}>
                  <span className="demo-role">{c.role}</span>
                  <span className="demo-id">ID: <code>{c.id}</code></span>
                  <span className="demo-pw">PW: <code>{c.password}</code></span>
                </div>
              ))}
            </div>
          </details>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
