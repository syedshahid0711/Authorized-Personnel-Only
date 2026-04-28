import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, FileText, Users, Activity, LogOut,
  Terminal, Shield, Eye, MessageSquare, Bell, CheckCheck
} from 'lucide-react';

const getMyMessages = (userName) => {
  try {
    const all = JSON.parse(localStorage.getItem('adminMessages') || '{}');
    return all[userName] || [];
  } catch { return []; }
};

const markAllRead = (userName) => {
  try {
    const all = JSON.parse(localStorage.getItem('adminMessages') || '{}');
    if (all[userName]) {
      all[userName] = all[userName].map(m => ({ ...m, read: true }));
      localStorage.setItem('adminMessages', JSON.stringify(all));
    }
  } catch { }
};

const Dashboard = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [showInbox, setShowInbox] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const msgs = getMyMessages(user);
    setMessages(msgs);
    setUnreadCount(msgs.filter(m => !m.read).length);
  }, [user]);

  const handleOpenInbox = () => {
    markAllRead(user);
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    setUnreadCount(0);
    setShowInbox(true);
  };

  const now = new Date().toLocaleString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* NAV */}
        <nav className="dashboard-nav">
          <div className="nav-brand">
            <ShieldCheck size={28} className="text-primary" />
            <h2>Army Command HQ</h2>
          </div>
          <div className="nav-user">
            <div className="user-profile">
              <span className="status-dot online" />
              <span>Soldier: <strong>{user.toUpperCase()}</strong></span>
            </div>
            <button className="inbox-bell-btn" onClick={handleOpenInbox} title="Commander's Orders">
              <MessageSquare size={18} />
              {unreadCount > 0 && <span className="inbox-badge">{unreadCount}</span>}
            </button>
            <button onClick={onLogout} className="btn-logout">
              <LogOut size={16} /> Stand Down
            </button>
          </div>
        </nav>

        {/* MAIN */}
        <main className="dashboard-content">
          <header className="dashboard-header-block">
            <div className="header-titles">
              <h1>Command Center</h1>
              <p>SOLDIER VERIFIED. BIOMETRIC AUTH SUCCESSFUL — SECURE LINE ESTABLISHED · {now}</p>
            </div>
            <div className="security-badge">
              <Shield size={16} />
              <span>Clearance: <strong>TOP SECRET — CLASS A</strong></span>
            </div>
          </header>

          {/* COMMANDER'S ORDERS INBOX */}
          {showInbox && (
            <div className="inbox-panel">
              <div className="inbox-header">
                <div className="inbox-title">
                  <Bell size={18} />
                  <h2>Commander's Orders</h2>
                  <span className="inbox-count-chip">{messages.length}</span>
                </div>
                <button className="inbox-close-btn" onClick={() => setShowInbox(false)}>
                  ✕ Dismiss
                </button>
              </div>

              {messages.length === 0 ? (
                <div className="inbox-empty">
                  <MessageSquare size={36} />
                  <p>No orders from Chief of Army. Await further instructions.</p>
                </div>
              ) : (
                <ul className="inbox-list">
                  {[...messages].reverse().map((msg, i) => (
                    <li key={i} className="inbox-msg-item">
                      <div className="inbox-msg-meta">
                        <span className="inbox-from">
                          <ShieldCheck size={12} /> Chief of Army
                        </span>
                        <span className="inbox-time">{msg.sentAt}</span>
                        <CheckCheck size={13} className="inbox-read-tick" title="Received" />
                      </div>
                      <p className="inbox-msg-text">{msg.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon bg-blue"><Users size={24} /></div>
              <div className="stat-info">
                <h3>Active Soldiers</h3>
                <p>14 / 250</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-green"><Activity size={24} /></div>
              <div className="stat-info">
                <h3>Base Status</h3>
                <p>OPERATIONAL</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-purple"><Eye size={24} /></div>
              <div className="stat-info">
                <h3>Threat Condition</h3>
                <p>DEFCON 5 — NORMAL</p>
              </div>
            </div>
          </div>

          {/* SPLIT */}
          <div className="dashboard-split">
            <section className="documents-section">
              <div className="section-header">
                <h2><FileText size={20} /> Classified Intel</h2>
              </div>
              <ul className="doc-list">
                <li className="doc-item">
                  <div className="doc-info">
                    <span className="doc-name">Operation_Eagle_Strike_PLAN.pdf</span>
                    <span className="doc-type">TOP SECRET — Mission Brief</span>
                  </div>
                  <span className="doc-date">Today, 04:30 HRS</span>
                </li>
                <li className="doc-item">
                  <div className="doc-info">
                    <span className="doc-name">Troop_Deployment_Q4_2024.xlsx</span>
                    <span className="doc-type">Classified — Field Orders</span>
                  </div>
                  <span className="doc-date">Yesterday, 22:00 HRS</span>
                </li>
                <li className="doc-item">
                  <div className="doc-info">
                    <span className="doc-name">Global_Threat_Assessment_INTEL.pdf</span>
                    <span className="doc-type">Intelligence Brief</span>
                  </div>
                  <span className="doc-date">Oct 12, 06:00 HRS</span>
                </li>
                <li className="doc-item">
                  <div className="doc-info">
                    <span className="doc-name">Base_Access_Logs_SECURE.csv</span>
                    <span className="doc-type">Security Log</span>
                  </div>
                  <span className="doc-date">Oct 10, 23:45 HRS</span>
                </li>
              </ul>
            </section>

            <section className="terminal-section">
              <div className="section-header">
                <h2><Terminal size={20} /> Field Operations Log</h2>
              </div>
              <div className="terminal-window">
                <div className="terminal-header">
                  <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                  <span className="terminal-title">root@army-command-hq</span>
                </div>
                <div className="terminal-body">
                  <p><span className="t-green">[SYSTEM]</span> Initializing secure military protocols...</p>
                  <p><span className="t-green">[SYSTEM]</span> Perimeter defense systems — ACTIVE.</p>
                  <p><span className="t-blue">[AUTH]</span> Biometric handshake verified.</p>
                  <p><span className="t-blue">[AUTH]</span> Soldier '{user.toUpperCase()}' cleared via facial recognition.</p>
                  <p><span className="t-yellow">[ALERT]</span> Blocked unauthorized access from IP 192.168.1.104.</p>
                  <p><span className="t-green">[INTEL]</span> Decrypting classified database keys...</p>
                  <p><span className="t-green">[STATUS]</span> All systems OPERATIONAL. No hostile activity detected.</p>
                  <p className="typing-line"><span className="t-gray">root@army-hq:~#</span> <span className="cursor">_</span></p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
