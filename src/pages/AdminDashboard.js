import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, LogOut, Trash2, UserCheck,
  Calendar, AlertCircle, Search, RefreshCw
} from 'lucide-react';

const AdminDashboard = ({ admin, onLogout }) => {
  const [members,  setMembers]  = useState([]);
  const [search,   setSearch]   = useState('');
  const [mounted,  setMounted]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // name to delete

  useEffect(() => {
    setTimeout(() => setMounted(true), 30);
    loadMembers();
  }, []);

  const loadMembers = () => {
    const stored = localStorage.getItem('registeredFaces');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Attach a timestamp if missing (for display)
        const withMeta = parsed.map((m, i) => ({
          ...m,
          index: i + 1,
          registeredAt: m.registeredAt || new Date().toLocaleString(),
        }));
        setMembers(withMeta);
      } catch {
        setMembers([]);
      }
    } else {
      setMembers([]);
    }
  };

  const handleDelete = (label) => {
    const stored = localStorage.getItem('registeredFaces');
    if (!stored) return;
    const parsed = JSON.parse(stored);
    const updated = parsed.filter(m => m.label !== label);
    localStorage.setItem('registeredFaces', JSON.stringify(updated));
    setConfirmDelete(null);
    loadMembers();
  };

  const filtered = members.filter(m =>
    m.label.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date().toLocaleString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className={`adm-page ${mounted ? 'adm-page--visible' : ''}`}>
      {/* ── NAV ── */}
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
            <span>Logged in as <strong>ID: {admin.id}</strong></span>
            <span className="adm-role-badge">{admin.role}</span>
          </div>
          <button className="adm-logout-btn" onClick={onLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="adm-main">
        {/* Header */}
        <header className="adm-header">
          <div>
            <h1>Registered Members</h1>
            <p>{now}</p>
          </div>
          <div className="adm-header-stats">
            <div className="adm-stat-pill">
              <Users size={16} />
              <span><strong>{members.length}</strong> Total Members</span>
            </div>
          </div>
        </header>

        {/* Search + Refresh bar */}
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

        {/* Members Table / Empty State */}
        {filtered.length === 0 ? (
          <div className="adm-empty">
            <AlertCircle size={48} />
            {members.length === 0
              ? <p>No faces registered yet. Register members via the Security Portal.</p>
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
                  <th>Face Descriptors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => (
                  <tr key={m.label} className="adm-table-row">
                    <td className="adm-td-num">{idx + 1}</td>
                    <td className="adm-td-name">
                      <div className="adm-avatar">
                        {m.label.charAt(0).toUpperCase()}
                      </div>
                      <span>{m.label}</span>
                    </td>
                    <td className="adm-td-date">{m.registeredAt}</td>
                    <td className="adm-td-desc">
                      <span className="adm-desc-count">
                        {m.descriptors ? m.descriptors.length : 0} face sample(s)
                      </span>
                    </td>
                    <td className="adm-td-action">
                      {confirmDelete === m.label ? (
                        <div className="adm-confirm-delete">
                          <span>Sure?</span>
                          <button className="adm-btn-yes" onClick={() => handleDelete(m.label)}>Yes</button>
                          <button className="adm-btn-no" onClick={() => setConfirmDelete(null)}>No</button>
                        </div>
                      ) : (
                        <button
                          className="adm-delete-btn"
                          onClick={() => setConfirmDelete(m.label)}
                          title="Remove member"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Confirm delete modal */}
    </div>
  );
};

export default AdminDashboard;
