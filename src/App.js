import React, { useState } from 'react';
import FaceAuth       from './components/FaceAuth';
import Dashboard      from './components/Dashboard';
import ParticleBackground from './components/ParticleBackground';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const BulletTransition = () => (
  <div className="bullet-transition-overlay">
    <div className="blast-vignette" />
    <div className="realistic-flash" />
    
    <div className="shockwave sw-1" />
    <div className="shockwave sw-2" />
    
    <div className="spark" style={{ '--rot': '12deg', '--tx': '40vw', '--ty': '15vh', animationDelay: '0.02s' }} />
    <div className="spark" style={{ '--rot': '-18deg', '--tx': '45vw', '--ty': '-20vh', animationDelay: '0.04s' }} />
    <div className="spark" style={{ '--rot': '8deg', '--tx': '30vw', '--ty': '10vh', animationDelay: '0.01s' }} />
    <div className="spark" style={{ '--rot': '-14deg', '--tx': '35vw', '--ty': '-15vh', animationDelay: '0.03s' }} />

    <div className="bullet-container">
      <div className="heat-trail" />
      <svg className="realistic-bullet" viewBox="0 0 100 20" preserveAspectRatio="none">
         <path d="M0,3 L65,3 Q90,3 100,10 Q90,17 65,17 L0,17 Z" fill="url(#copperGrad)" />
         <defs>
           <linearGradient id="copperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" stopColor="#8c5220" />
             <stop offset="25%" stopColor="#e6994c" />
             <stop offset="50%" stopColor="#ffcc80" />
             <stop offset="75%" stopColor="#995c1f" />
             <stop offset="100%" stopColor="#4d2600" />
           </linearGradient>
         </defs>
      </svg>
    </div>
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
    }, 200); // Swap screen right when the muzzle flash is brightest
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800); // Wait for bullet and smoke trail to finish
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
    <div className={`App ${isTransitioning ? 'shaking' : ''}`}>
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