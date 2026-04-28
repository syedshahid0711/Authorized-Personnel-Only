import React, { useState } from 'react';
import FaceAuth       from './components/FaceAuth';
import Dashboard      from './components/Dashboard';
import ParticleBackground from './components/ParticleBackground';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const BulletTransition = () => (
  <div className="bullet-transition-overlay">
    <div className="muzzle-flash" />
    <div className="bullet-trail" />
    <div className="bullet-projectile" />
  </div>
);

// App screens:
//   'face-auth'        → face scanner (default)
//   'user-dashboard'   → shown after face recognition success
//   'admin-login'      → full-page admin login
//   'admin-dashboard'  → admin view of all registered members

function App() {
  const [screen,    setScreen]    = useState('face-auth');
  const [userName,  setUserName]  = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Helper to trigger bullet transition when switching pages
  const navigateTo = (newScreen) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen(newScreen);
    }, 150); // Swap screen right when the muzzle flash is brightest
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600); // Wait for bullet and smoke trail to finish
  };

  // Face auth success → user dashboard
  const handleFaceAuthSuccess = (name) => {
    setUserName(name);
    navigateTo('user-dashboard');
  };

  // User logs out → back to face scanner
  const handleUserLogout = () => {
    setUserName('');
    navigateTo('face-auth');
  };

  // Admin logs in
  const handleAdminLoginSuccess = (admin) => {
    setAdminUser(admin);
    navigateTo('admin-dashboard');
  };

  // Admin logs out
  const handleAdminLogout = () => {
    setAdminUser(null);
    navigateTo('face-auth');
  };

  return (
    <div className="App">
      <ParticleBackground />
      {isTransitioning && <BulletTransition />}

      {screen === 'face-auth' && (
        <FaceAuth
          onAuthSuccess={handleFaceAuthSuccess}
          onAdminClick={() => navigateTo('admin-login')}
        />
      )}

      {screen === 'user-dashboard' && (
        <Dashboard user={userName} onLogout={handleUserLogout} />
      )}

      {screen === 'admin-login' && (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={() => navigateTo('face-auth')}
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