import React, { useState } from 'react';
import FaceAuth       from './components/FaceAuth';
import Dashboard      from './components/Dashboard';
import ParticleBackground from './components/ParticleBackground';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// App screens:
//   'face-auth'        → face scanner (default)
//   'user-dashboard'   → shown after face recognition success
//   'admin-login'      → full-page admin login
//   'admin-dashboard'  → admin view of all registered members

function App() {
  const [screen,    setScreen]    = useState('face-auth');
  const [userName,  setUserName]  = useState('');
  const [adminUser, setAdminUser] = useState(null);

  // Face auth success → user dashboard
  const handleFaceAuthSuccess = (name) => {
    setUserName(name);
    setScreen('user-dashboard');
  };

  // User logs out → back to face scanner
  const handleUserLogout = () => {
    setUserName('');
    setScreen('face-auth');
  };

  // Admin logs in
  const handleAdminLoginSuccess = (admin) => {
    setAdminUser(admin);
    setScreen('admin-dashboard');
  };

  // Admin logs out
  const handleAdminLogout = () => {
    setAdminUser(null);
    setScreen('face-auth');
  };

  return (
    <div className="App">
      <ParticleBackground />

      {screen === 'face-auth' && (
        <FaceAuth
          onAuthSuccess={handleFaceAuthSuccess}
          onAdminClick={() => setScreen('admin-login')}
        />
      )}

      {screen === 'user-dashboard' && (
        <Dashboard user={userName} onLogout={handleUserLogout} />
      )}

      {screen === 'admin-login' && (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={() => setScreen('face-auth')}
        />
      )}

      {screen === 'admin-dashboard' && (
        <AdminDashboard
          admin={adminUser}
          onLogout={handleAdminLogout}
        />
      )}
    </div>
  );
}

export default App;