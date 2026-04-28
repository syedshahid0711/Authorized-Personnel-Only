import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import {
  ShieldCheck, Users, LogOut, Trash2, UserCheck,
  Calendar, AlertCircle, Search, RefreshCw,
  UserPlus, Camera, Loader2, Send, MessageSquare,
  X, CheckCircle, Bell
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────
const getMessages = () => {
  try { return JSON.parse(localStorage.getItem('adminMessages') || '{}'); }
  catch { return {}; }
};
const saveMessages = (msgs) => localStorage.setItem('adminMessages', JSON.stringify(msgs));

// ─── EnlistSoldierPanel (face registration) ─────────────────────
const EnlistSoldierPanel = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('LOADING TACTICAL AI MODULES...');
  const [statusType, setStatusType] = useState('info');
  const [streaming, setStreaming] = useState(false);

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
        setStatus('AI MODULES READY. ACTIVATING CAMERA...');
        startCamera();
      } catch {
        if (mounted) { setStatus('SYSTEM ERROR: AI MODULES FAILED.'); setStatusType('error'); }
      }
    };
    load();
    return () => { mounted = false; stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreaming(true);
          setStatus('POSITION SOLDIER\'S FACE IN FRAME.');
          setStatusType('info');
        }
      })
      .catch(() => { setStatus('SURVEILLANCE CAMERA ACCESS DENIED.'); setStatusType('error'); });
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
  };

  const handleCapture = async () => {
    if (!name.trim()) { setStatus('ENTER SOLDIER\'S NAME BEFORE CAPTURE.'); setStatusType('error'); return; }
    setStatus('CAPTURING BIOMETRIC DATA...'); setStatusType('info');

    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result) { setStatus('NO FACE DETECTED IN FRAME. RETRY.'); setStatusType('error'); return; }

    const stored = localStorage.getItem('registeredFaces');
    const existing = stored ? JSON.parse(stored) : [];

    if (existing.find(f => f.label.toLowerCase() === name.trim().toLowerCase())) {
      setStatus(`SOLDIER "${name.trim().toUpperCase()}" ALREADY ENLISTED.`); setStatusType('error'); return;
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

    if (canvasRef.current && videoRef.current) {
      const size = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvasRef.current, size);
      faceapi.draw.drawDetections(canvasRef.current, faceapi.resizeResults(result, size));
    }

    setStatus(`✅ SOLDIER "${name.trim().toUpperCase()}" SUCCESSFULLY ENLISTED.`); setStatusType('success');
    setName('');
  };

  return (
    <div className="rfp-panel">
      <div className="rfp-video-area">
        {!modelsLoaded && (
          <div className="rfp-loading-overlay">
            <Loader2 size={40} className="rfp-spinner" />
            <p>LOADING TACTICAL AI SYSTEMS...</p>
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
          placeholder="Enter soldier's full name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rfp-name-input"
          onKeyDown={e => e.key === 'Enter' && handleCapture()}
        />
        <button className="rfp-capture-btn" onClick={handleCapture} disabled={!modelsLoaded || !streaming}>
          <Camera size={18} /> Capture &amp; Enlist Soldier
        </button>
      </div>
    </div>
  );
};

// ─── DispatchOrdersModal ───────────────────────────────────────
const DispatchOrdersModal = ({ soldier, onClose }) => {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    const msgs = getMessages();
    if (!msgs[soldier]) msgs[soldier] = [];
    msgs[soldier].push({
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
          <div className="smm-avatar">{soldier.charAt(0).toUpperCase()}</div>
          <div>
            <h3>Dispatch Orders</h3>
            <p>To Soldier: <strong>{soldier.toUpperCase()}</strong> · Orders delivered on next login</p>
          </div>
        </div>

        {sent ? (
          <div className="smm-sent">
            <CheckCircle size={32} />
            <span>ORDERS DISPATCHED!</span>
          </div>
        ) : (
          <>
            <textarea
              className="smm-textarea"
              placeholder={`Enter orders for Soldier ${soldier.toUpperCase()}...`}
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              autoFocus
            />
            <button className="smm-send-btn" onClick={handleSend} disabled={!text.trim()}>
              <Send size={16} /> Dispatch Orders
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── SoldiersTab ───────────────────────────────────────────────
const SoldiersTab = () => {
  const [soldiers, setSoldiers] = useState([]);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dispatching, setDispatching] = useState(null);

  useEffect(() => { loadSoldiers(); }, []);

  const loadSoldiers = () => {
    const stored = localStorage.getItem('registeredFaces');
    if (stored) {
      try { setSoldiers(JSON.parse(stored).map((m, i) => ({ ...m, index: i + 1 }))); }
      catch { setSoldiers([]); }
    } else { setSoldiers([]); }
  };

  const handleDischarge = (label) => {
    const stored = localStorage.getItem('registeredFaces');
    if (!stored) return;
    const updated = JSON.parse(stored).filter(m => m.label !== label);
    localStorage.setItem('registeredFaces', JSON.stringify(updated));
    const msgs = getMessages(); delete msgs[label]; saveMessages(msgs);
    setConfirmDelete(null);
    loadSoldiers();
  };

  const msgs = getMessages();
  const filtered = soldiers.filter(m => m.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-tab-content">
      <div className="adm-toolbar">
        <div className="adm-search-wrapper">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            placeholder="Search soldier by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="adm-search-input"
          />
        </div>
        <button className="adm-refresh-btn" onClick={loadSoldiers}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="adm-empty">
          <Users size={48} />
          {soldiers.length === 0
            ? <p>No soldiers enlisted yet.<br />Use "Enlist New Soldier" tab to add troops.</p>
            : <p>No soldiers match your search.</p>
          }
        </div>
      ) : (
        <div className="adm-table-wrapper">
          <table className="adm-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th><UserCheck size={14} /> SOLDIER NAME</th>
                <th><Calendar size={14} /> ENLISTED</th>
                <th><Bell size={14} /> ORDERS</th>
                <th>COMMAND</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => {
                const soldierMsgs = msgs[m.label] || [];
                const unread = soldierMsgs.filter(msg => !msg.read).length;
                return (
                  <tr key={m.label} className="adm-table-row">
                    <td className="adm-td-num">PVT-{String(idx + 1).padStart(3, '0')}</td>
                    <td className="adm-td-name">
                      <div className="adm-avatar">{m.label.charAt(0).toUpperCase()}</div>
                      <span>{m.label.toUpperCase()}</span>
                    </td>
                    <td className="adm-td-date">{m.registeredAt || '—'}</td>
                    <td>
                      <span className={`adm-msg-count ${unread > 0 ? 'adm-msg-count--unread' : ''}`}>
                        {soldierMsgs.length} dispatched{unread > 0 ? ` · ${unread} unread` : ''}
                      </span>
                    </td>
                    <td className="adm-td-action">
                      <div className="adm-action-row">
                        <button className="adm-send-btn" onClick={() => setDispatching(m.label)}>
                          <MessageSquare size={14} /> Dispatch
                        </button>
                        {confirmDelete === m.label ? (
                          <div className="adm-confirm-delete">
                            <span>Discharge?</span>
                            <button className="adm-btn-yes" onClick={() => handleDischarge(m.label)}>Yes</button>
                            <button className="adm-btn-no" onClick={() => setConfirmDelete(null)}>No</button>
                          </div>
                        ) : (
                          <button className="adm-delete-btn" onClick={() => setConfirmDelete(m.label)}>
                            <Trash2 size={14} /> Discharge
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

      {dispatching && (
        <DispatchOrdersModal soldier={dispatching} onClose={() => { setDispatching(null); loadSoldiers(); }} />
      )}
    </div>
  );
};

// ─── AdminDashboard (main) ─────────────────────────────────────
const AdminDashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('soldiers');

  const soldierCount = (() => {
    const s = localStorage.getItem('registeredFaces');
    return s ? JSON.parse(s).length : 0;
  })();

  const now = new Date().toLocaleString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="adm-page adm-page--visible">
      {/* NAV */}
      <nav className="adm-nav">
        <div className="adm-nav-brand">
          <ShieldCheck size={26} className="adm-brand-icon" />
          <div>
            <span className="adm-brand-title">Army Command HQ</span>
            <span className="adm-brand-sub">Chief of Army — Command Panel</span>
          </div>
        </div>
        <div className="adm-nav-right">
          <div className="adm-session-info">
            <div className="adm-session-dot" />
            <span>Army ID: <strong>{admin.id}</strong></span>
            <span className="adm-role-badge">{admin.role}</span>
          </div>
          <button className="adm-logout-btn" onClick={onLogout}>
            <LogOut size={15} /> Stand Down
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="adm-main">
        <header className="adm-header">
          <div>
            <h1>Command Center</h1>
            <p>{now}</p>
          </div>
          <div className="adm-header-stats">
            <div className="adm-stat-pill">
              <Users size={16} />
              <span><strong>{soldierCount}</strong> Enlisted Soldiers</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="adm-tabs">
          <button
            className={`adm-tab-btn ${activeTab === 'soldiers' ? 'adm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('soldiers')}
          >
            <Users size={16} /> Soldiers &amp; Dispatch Orders
          </button>
          <button
            className={`adm-tab-btn ${activeTab === 'enlist' ? 'adm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('enlist')}
          >
            <UserPlus size={16} /> Enlist New Soldier
          </button>
        </div>

        {activeTab === 'soldiers' && <SoldiersTab />}
        {activeTab === 'enlist' && (
          <div className="adm-tab-content">
            <div className="rfp-intro">
              <div className="rfp-intro-icon"><UserPlus size={22} /></div>
              <div>
                <h3>Enlist a New Soldier</h3>
                <p>Position the soldier's face clearly in front of the camera, enter their name, and capture their biometric data.</p>
              </div>
            </div>
            <EnlistSoldierPanel />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
