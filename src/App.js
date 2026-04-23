import React, { useState } from 'react';
import FaceAuth from './components/FaceAuth';
import Dashboard from './components/Dashboard';
import ParticleBackground from './components/ParticleBackground';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  const handleAuthSuccess = (name) => {
    setUserName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
  };

  return (
    <div className="App">
      <ParticleBackground />
      {!isAuthenticated ? (
        <FaceAuth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Dashboard user={userName} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;