import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertTriangle, KeyRound, ArrowLeft } from 'lucide-react';

// ── Your admin credentials ──────────────────────────────────────
const ADMIN_ID       = '29092009';
const ADMIN_PASSWORD = 'itsshahid';
// ────────────────────────────────────────────────────────────────

const AdminLoginPage = ({ onLoginSuccess, onBack }) => {
  const [adminId,      setAdminId]      = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [attempts,     setAttempts]     = useState(0);
  const [locked,       setLocked]       = useState(false);
  const [lockTimer,    setLockTimer]    = useState(0);
  const [shake,        setShake]        = useState(false);
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 30); }, []);

  // Countdown timer when locked
  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      setLockTimer(t => {
        if (t <= 1) { setLocked(false); setAttempts(0); setError(''); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (locked) return;

    if (adminId.trim() === ADMIN_ID && password === ADMIN_PASSWORD) {
      setError('');
      setMounted(false);
      setTimeout(() => onLoginSuccess({ id: ADMIN_ID, role: 'Main Administrator' }), 400);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      triggerShake();
      setPassword('');
      if (next >= 3) {
        setLocked(true);
        setLockTimer(30);
        setError('Too many failed attempts. Locked for 30 seconds.');
      } else {
        setError(`Incorrect credentials. ${3 - next} attempt(s) remaining.`);
      }
    }
  };

  return (
    <div className={`alp-page ${mounted ? 'alp-page--visible' : ''}`}>
      {/* Animated background rings */}
      <div className="alp-rings">
        <div className="alp-ring alp-ring--1" />
        <div className="alp-ring alp-ring--2" />
        <div className="alp-ring alp-ring--3" />
      </div>

      <div className={`alp-card ${shake ? 'alp-card--shake' : ''} ${mounted ? 'alp-card--visible' : ''}`}>

        {/* Back button */}
        <button className="alp-back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Portal
        </button>

        {/* Header */}
        <div className="alp-header">
          <div className="alp-shield-ring">
            <ShieldCheck size={36} />
          </div>
          <h1>Admin Control Panel</h1>
          <p>Authorized personnel only — enter your credentials</p>
        </div>

        {/* Lock banner */}
        {locked && (
          <div className="alp-lock-banner">
            <AlertTriangle size={16} />
            <span>Account locked &middot; {lockTimer}s remaining</span>
          </div>
        )}

        {/* Login form */}
        <form className="alp-form" onSubmit={handleLogin} autoComplete="off">
          {/* Admin ID */}
          <div className="alp-field">
            <label htmlFor="alp-id">
              <User size={13} /> Admin ID
            </label>
            <input
              id="alp-id"
              type="text"
              placeholder="Enter your admin ID"
              value={adminId}
              onChange={e => { setAdminId(e.target.value); setError(''); }}
              disabled={locked}
              spellCheck={false}
            />
          </div>

          {/* Password */}
          <div className="alp-field">
            <label htmlFor="alp-pw">
              <Lock size={13} /> Password
            </label>
            <div className="alp-pw-wrapper">
              <input
                id="alp-pw"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                disabled={locked}
              />
              <button
                type="button"
                className="alp-toggle-pw"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="alp-error">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="alp-submit"
            disabled={locked || !adminId || !password}
          >
            <KeyRound size={18} />
            Authenticate &amp; Enter
          </button>
        </form>

        <p className="alp-footer-note">
          This portal is monitored. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
