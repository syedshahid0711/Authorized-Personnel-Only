import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import {
  ShieldCheck, Users, LogOut, Trash2, UserCheck,
  Calendar, AlertCircle, Search, RefreshCw,
  UserPlus, Camera, Loader2, Send, MessageSquare,
  X, CheckCircle, ChevronRight, Bell
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────
const getMessages = () => {
  try { return JSON.parse(localStorage.getItem('adminMessages') || '{}'); }
  catch { return {}; }
};
const saveMessages = (msgs) => localStorage.setItem('adminMessages', JSON.stringify(msgs));

// ─── RegisterFacePanel ─────────────────────────────────────────
const RegisterFacePanel = () => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [name,         setName]         = useState('');
  const [status,       setStatus]       = useState('Loading AI models...');
  const [statusType,   setStatusType]   = useState('info'); // info | success | error
  const [streaming,    setStreaming]     = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        if (!mounted) return;
        setModelsLoaded(true);
        setStatus('Models ready. Starting camera...');
        startCamera();
      } catch {
        if (mounted) setStatus('Failed to load AI models.');
      }
    };
    load();
    return () => {
      mounted = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreaming(true);
          setStatus('Position the person\'s face in the camera.');
          setStatusType('info');
        }
      })
      .catch(() => { setStatus('Camera access denied.'); setStatusType('error'); });
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const handleCapture = async () => {
    if (!name.trim()) { setStatus('Enter a name first.'); setStatusType('error'); return; }
    setStatus('Capturing face data...'); setStatusType('info');

    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result) { setStatus('No face detected. Try again.'); setStatusType('error'); return; }

    const stored = localStorage.getItem('registeredFaces');
    const existing = stored ? JSON.parse(stored) : [];

    // Prevent duplicate name
    if (existing.find(f => f.label.toLowerCase() === name.trim().toLowerCase())) {
      setStatus(`"${name.trim()}" is already registered.`); setStatusType('error'); return;
    }

    const newFace = {
      label: name.trim(),
      descriptors: [Array.from(result.descriptor)],
      registeredAt: new Date().toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }),
    };

    localStorage.setItem('registeredFaces', JSON.stringify([...existing, newFace]));

    // Draw detection on canvas
    if (canvasRef.current && videoRef.current) {
      const size = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvasRef.current, size);
      faceapi.draw.drawDetections(canvasRef.current, faceapi.resizeResults(result, size));
    }

    setStatus(`✅ "${name.trim()}" registered successfully!`); setStatusType('success');
    setName('');
  };

  return (
    <div className="rfp-panel">
      <div className="rfp-video-area">
        {!modelsLoaded && (
          <div className="rfp-loading-overlay">
            <Loader2 size={40} className="rfp-spinner" />
            <p>Loading AI Face Models...</p>
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline className="rfp-video" />
        <canvas ref={canvasRef} className="rfp-canvas" />
        <div className="scanner-bracket tl" /><div className="scanner-bracket tr" />
        <div className="scanner-bracket bl" /><div className="scanner-bracket br" />
        {streaming && <div className="scan-line" />}
      </div>

      <div className={`rfp-status rfp-status--${statusType}`}>
        {statusType === 'success' ? <CheckCircle size={16} /> : statusType === 'error' ? <AlertCircle size={16} /> : <Camera size={16} />}
        <span>{status}</span>
      </div>

      <div className="rfp-form">
        <input
          type="text"
          placeholder="Enter member's full name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rfp-name-input"
          onKeyDown={e => e.key === 'Enter' && handleCapture()}
        />
        <button
          className="rfp-capture-btn"
          onClick={handleCapture}
          disabled={!modelsLoaded || !streaming}
        >
          <Camera size={18} /> Capture & Register
        </button>
      </div>
    </div>
  );
};

// ─── SendMessageModal ──────────────────────────────────────────
const SendMessageModal = ({ member, onClose }) => {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    const msgs = getMessages();
    if (!msgs[member]) msgs[member] = [];
    msgs[member].push({
      text: text.trim(),
      sentAt: new Date().toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }),
      read: false,
    });
    saveMessages(msgs);
    setSent(true);
    setTimeout(onClose, 1400);
  };

  return (
    <div className="smm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="smm-card">
        <button className="smm-close" onClick={onClose}><X size={16} /></button>
        <div className="smm-header">
          <div className="smm-avatar">{member.charAt(0).toUpperCase()}</div>
          <div>
            <h3>Send Message</h3>
            <p>To: <strong>{member}</strong> · will see this on next login</p>
          </div>
        </div>

        {sent ? (
          <div className="smm-sent">
            <CheckCircle size={32} />
            <span>Message sent!</span>
          </div>
        ) : (
          <>
            <textarea
              className="smm-textarea"
              placeholder={`Type your message to ${member}...`}
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              autoFocus
            />
            <button className="smm-send-btn" onClick={handleSend} disabled={!text.trim()}>
              <Send size={16} /> Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── MembersTab ────────────────────────────────────────────────
const MembersTab = () => {
  const [members,       setMembers]       = useState([]);
  const [search,        setSearch]        = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [messaging,     setMessaging]     = useState(null);

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = () => {
    const stored = localStorage.getItem('registeredFaces');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMembers(parsed.map((m, i) => ({ ...m, index: i + 1 })));
      } catch { setMembers([]); }
    } else { setMembers([]); }
  };

  const handleDelete = (label) => {
    const stored = localStorage.getItem('registeredFaces');
    if (!stored) return;
    const updated = JSON.parse(stored).filter(m => m.label !== label);
    localStorage.setItem('registeredFaces', JSON.stringify(updated));
    // Also remove their messages
    const msgs = getMessages();
    delete msgs[label];
    saveMessages(msgs);
    setConfirmDelete(null);
    loadMembers();
  };

  const msgs = getMessages();
  const filtered = members.filter(m => m.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-tab-content">
      <div className="adm-toolbar">
        <div className="adm-search-wrapper">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            placeholder="Search member by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="adm-search-input"
          />
        </div>
        <button className="adm-refresh-btn" onClick={loadMembers}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="adm-empty">
          <Users size={48} />
          {members.length === 0
            ? <p>No members registered yet.<br />Use "Register New Face" tab to add members.</p>
            : <p>No members match your search.</p>
          }
        </div>
      ) : (
        <div className="adm-table-wrapper">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th><UserCheck size={14} /> Member Name</th>
                <th><Calendar size={14} /> Registered</th>
                <th><Bell size={14} /> Messages</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => {
                const memberMsgs = msgs[m.label] || [];
                const unread = memberMsgs.filter(msg => !msg.read).length;
                return (
                  <tr key={m.label} className="adm-table-row">
                    <td className="adm-td-num">{idx + 1}</td>
                    <td className="adm-td-name">
                      <div className="adm-avatar">{m.label.charAt(0).toUpperCase()}</div>
                      <span>{m.label}</span>
                    </td>
                    <td className="adm-td-date">{m.registeredAt || '—'}</td>
                    <td>
                      <span className={`adm-msg-count ${unread > 0 ? 'adm-msg-count--unread' : ''}`}>
                        {memberMsgs.length} sent{unread > 0 ? ` · ${unread} unread` : ''}
                      </span>
                    </td>
                    <td className="adm-td-action">
                      <div className="adm-action-row">
                        <button className="adm-send-btn" onClick={() => setMessaging(m.label)}>
                          <MessageSquare size={14} /> Message
                        </button>
                        {confirmDelete === m.label ? (
                          <div className="adm-confirm-delete">
                            <span>Sure?</span>
                            <button className="adm-btn-yes" onClick={() => handleDelete(m.label)}>Yes</button>
                            <button className="adm-btn-no" onClick={() => setConfirmDelete(null)}>No</button>
                          </div>
                        ) : (
                          <button className="adm-delete-btn" onClick={() => setConfirmDelete(m.label)}>
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {messaging && (
        <SendMessageModal member={messaging} onClose={() => { setMessaging(null); loadMembers(); }} />
      )}
    </div>
  );
};

// ─── AdminDashboard (main) ─────────────────────────────────────
const AdminDashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('members');
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 30); }, []);

  const now = new Date().toLocaleString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const memberCount = (() => {
    const s = localStorage.getItem('registeredFaces');
    return s ? JSON.parse(s).length : 0;
  })();

  return (
    <div className={`adm-page ${mounted ? 'adm-page--visible' : ''}`}>
      {/* NAV */}
      <nav className="adm-nav">
        <div className="adm-nav-brand">
          <ShieldCheck size={26} className="adm-brand-icon" />
          <div>
            <span className="adm-brand-title">Nexus Security Core</span>
            <span className="adm-brand-sub">Admin Control Panel</span>
          </div>
        </div>
        <div className="adm-nav-right">
          <div className="adm-session-info">
            <div className="adm-session-dot" />
            <span>ID: <strong>{admin.id}</strong></span>
            <span className="adm-role-badge">{admin.role}</span>
          </div>
          <button className="adm-logout-btn" onClick={onLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="adm-main">
        {/* Header */}
        <header className="adm-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>{now}</p>
          </div>
          <div className="adm-header-stats">
            <div className="adm-stat-pill">
              <Users size={16} />
              <span><strong>{memberCount}</strong> Registered Members</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="adm-tabs">
          <button
            className={`adm-tab-btn ${activeTab === 'members' ? 'adm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} /> Members &amp; Messages
          </button>
          <button
            className={`adm-tab-btn ${activeTab === 'register' ? 'adm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <UserPlus size={16} /> Register New Face
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'members' && <MembersTab />}
        {activeTab === 'register' && (
          <div className="adm-tab-content">
            <div className="rfp-intro">
              <div className="rfp-intro-icon"><UserPlus size={22} /></div>
              <div>
                <h3>Register a New Member</h3>
                <p>Position the person's face in front of the camera, enter their name, then click capture.</p>
              </div>
            </div>
            <RegisterFacePanel />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
