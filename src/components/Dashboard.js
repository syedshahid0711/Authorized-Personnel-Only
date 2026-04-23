import React from 'react';
import { ShieldCheck, FileText, Users, Activity, LogOut, Terminal, Shield, Eye } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-wrapper fade-in-up">
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="nav-brand">
            <ShieldCheck size={28} className="text-primary" />
            <h2>Nexus Security Core</h2>
          </div>
          <div className="nav-user">
            <div className="user-profile">
              <span className="status-dot online"></span>
              <span>Operative: <strong>{user}</strong></span>
            </div>
            <button onClick={onLogout} className="btn-logout">
              <LogOut size={16} /> Disconnect
            </button>
          </div>
        </nav>

        <main className="dashboard-content">
          <header className="dashboard-header-block">
            <div className="header-titles">
              <h1>Central Command</h1>
              <p>Biometric authentication successful. Secure connection established.</p>
            </div>
            <div className="security-badge">
              <Shield size={16} /> 
              <span>Clearance: <strong>Level 5 (Top Secret)</strong></span>
            </div>
          </header>

          <div className="stats-grid stagger-1">
            <div className="stat-card">
              <div className="stat-icon bg-blue"><Users size={24} /></div>
              <div className="stat-info">
                <h3>Active Personnel</h3>
                <p>14 / 250</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-green"><Activity size={24} /></div>
              <div className="stat-info">
                <h3>Server Status</h3>
                <p>Optimal</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-purple"><Eye size={24} /></div>
              <div className="stat-info">
                <h3>Threat Level</h3>
                <p>Low (Alpha)</p>
              </div>
            </div>
          </div>

          <div className="dashboard-split stagger-2">
            <section className="documents-section">
              <div className="section-header">
                <h2><FileText size={20} /> Encrypted Database</h2>
              </div>
              <ul className="doc-list">
                <li className="doc-item">
                  <div className="doc-info">
                    <span className="doc-name">Project_Aegis_Source.zip</span>
                    <span className="doc-type">Encrypted Archive</span>
                  </div>
                  <span className="doc-date">Today, 09:41 AM</span>
                </li>
                <li className="doc-item">
                  <div className="doc-info">
                    <span className="doc-name">Financial_Q3_Confidential.xlsx</span>
                    <span className="doc-type">Spreadsheet</span>
                  </div>
                  <span className="doc-date">Yesterday, 14:22 PM</span>
                </li>
                <li className="doc-item">
                  <div className="doc-info">
                    <span className="doc-name">Global_Threat_Assessment.pdf</span>
                    <span className="doc-type">Intelligence Brief</span>
                  </div>
                  <span className="doc-date">Oct 12, 08:00 AM</span>
                </li>
                <li className="doc-item">
                  <div className="doc-info">
                    <span className="doc-name">Server_Access_Logs.csv</span>
                    <span className="doc-type">System Log</span>
                  </div>
                  <span className="doc-date">Oct 10, 23:45 PM</span>
                </li>
              </ul>
            </section>

            <section className="terminal-section">
              <div className="section-header">
                <h2><Terminal size={20} /> Live System Monitor</h2>
              </div>
              <div className="terminal-window">
                <div className="terminal-header">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                  <span className="terminal-title">bash - root@nexus-core</span>
                </div>
                <div className="terminal-body">
                  <p><span className="t-green">[SYSTEM]</span> Initializing secure protocols...</p>
                  <p><span className="t-green">[SYSTEM]</span> Firewall active on all ports.</p>
                  <p><span className="t-blue">[AUTH]</span> Handshake successful with client.</p>
                  <p><span className="t-blue">[AUTH]</span> User '{user}' authenticated via neural/facial scan.</p>
                  <p><span className="t-yellow">[WARN]</span> Blocked unauthorized ping from IP 192.168.1.104.</p>
                  <p><span className="t-green">[DATA]</span> Decrypting database access keys...</p>
                  <p className="typing-line"><span className="t-gray">root@nexus:~#</span> <span className="cursor">_</span></p>
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
