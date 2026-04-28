import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertTriangle, KeyRound, ArrowLeft } from 'lucide-react';

const ADMIN_ID       = '29092009';
const ADMIN_PASSWORD = 'itsshahid';

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
      setTimeout(() => onLoginSuccess({ id: ADMIN_ID, role: 'Chief of the Army' }), 400);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      triggerShake();
      setPassword('');
      if (next >= 3) {
        setLocked(true);
        setLockTimer(30);
        setError('ACCESS LOCKED: Too many failed attempts. Stand down for 30 seconds.');
      } else {
        setError(`AUTHORIZATION FAILED. ${3 - next} attempt(s) remaining before lockout.`);
      }
    }
  };

  return (
    <div className={`alp-page ${mounted ? 'alp-page--visible' : ''}`}>
      <div className="alp-rings">
        <div className="alp-ring alp-ring--1" />
        <div className="alp-ring alp-ring--2" />
        <div className="alp-ring alp-ring--3" />
      </div>

      <div className={`alp-card ${shake ? 'alp-card--shake' : ''} ${mounted ? 'alp-card--visible' : ''}`}>

        <button className="alp-back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Return to Base
        </button>

        <div className="alp-header">
          <div className="alp-shield-ring">
            <ShieldCheck size={36} />
          </div>
          <h1>Chief of the Army</h1>
          <p>TOP SECRET — COMMAND ACCESS ONLY</p>
        </div>

        {locked && (
          <div className="alp-lock-banner">
            <AlertTriangle size={16} />
            <span>COMMAND LOCKED · Stand down {lockTimer}s</span>
          </div>
        )}

        <form className="alp-form" onSubmit={handleLogin} autoComplete="off">
          <div className="alp-field">
            <label htmlFor="alp-id">
              <User size={13} /> Army ID
            </label>
            <input
              id="alp-id"
              type="text"
              placeholder="Enter your Army ID"
              value={adminId}
              onChange={e => { setAdminId(e.target.value); setError(''); }}
              disabled={locked}
              spellCheck={false}
            />
          </div>

          <div className="alp-field">
            <label htmlFor="alp-pw">
              <Lock size={13} /> Authorization Code
            </label>
            <div className="alp-pw-wrapper">
              <input
                id="alp-pw"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter authorization code"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                disabled={locked}
              />
              <button type="button" className="alp-toggle-pw" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alp-error">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="alp-submit" disabled={locked || !adminId || !password}>
            <KeyRound size={18} />
            Authenticate &amp; Enter Command
          </button>
        </form>

        <p className="alp-footer-note">
          ⚠ This terminal is monitored by Military Intelligence. All unauthorized access attempts are logged and prosecuted.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
