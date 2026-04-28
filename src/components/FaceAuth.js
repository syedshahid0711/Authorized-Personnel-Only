import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, UserPlus, ScanFace, Loader2, ShieldAlert, KeyRound } from 'lucide-react';

const FaceAuth = ({ onAuthSuccess, onAdminClick }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [mode, setMode] = useState('scan'); // 'scan' | 'register'
  const [registerName, setRegisterName] = useState('');
  const [statusMessage, setStatusMessage] = useState('Loading AI Models...');
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const failedAttemptsRef = useRef(0);
  const faceMatcherRef = useRef(null);
  const modeRef = useRef(mode);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { faceMatcherRef.current = faceMatcher; }, [faceMatcher]);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatusMessage('Starting Webcam...');
        startVideo();
        loadRegisteredFaces();
      } catch (err) {
        console.error('Error loading models:', err);
        setStatusMessage('Error loading AI models.');
      }
    };
    loadModels();
  }, []);

  // Build FaceMatcher whenever registeredFaces change
  useEffect(() => {
    if (registeredFaces.length > 0) {
      const labeled = registeredFaces.map(rf => {
        const descriptors = rf.descriptors.map(d => new Float32Array(Object.values(d)));
        return new faceapi.LabeledFaceDescriptors(rf.label, descriptors);
      });
      setFaceMatcher(new faceapi.FaceMatcher(labeled, 0.38));
    } else {
      setFaceMatcher(null);
    }
  }, [registeredFaces]);

  const loadRegisteredFaces = () => {
    const stored = localStorage.getItem('registeredFaces');
    if (stored) setRegisteredFaces(JSON.parse(stored));
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(err => {
        console.error('Webcam error:', err);
        setStatusMessage('Webcam access denied.');
      });
  };

  const handleVideoPlay = () => {
    if (mode === 'scan') {
      setStatusMessage('Scanning for Authorized Personnel...');
      scanLoop();
    } else {
      setStatusMessage('Position face clearly in camera.');
    }
  };

  const scanLoop = async () => {
    if (modeRef.current !== 'scan' || !videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (result) {
      if (canvasRef.current && videoRef.current) {
        const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resized = faceapi.resizeResults(result, displaySize);
        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resized);
      }

      if (faceMatcherRef.current) {
        const bestMatch = faceMatcherRef.current.findBestMatch(result.descriptor);
        if (bestMatch.label !== 'unknown') {
          failedAttemptsRef.current = 0;
          setStatusMessage(`Match Found: ${bestMatch.label}! Authenticating...`);
          setTimeout(() => {
            if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            onAuthSuccess(bestMatch.label);
          }, 1500);
          return;
        } else {
          failedAttemptsRef.current += 1;
          setStatusMessage(
            failedAttemptsRef.current >= 15
              ? '⚠️ CRITICAL: SECURITY BREACH. AUTHORITIES ALERTED! ⚠️'
              : 'Access Denied. Face not recognized.'
          );
        }
      } else {
        setStatusMessage('No registered faces found in database.');
      }
    } else {
      failedAttemptsRef.current = 0;
      if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setStatusMessage('Scanning for Authorized Personnel...');
    }

    setTimeout(() => scanLoop(), 200);
  };

  const handleRegisterFace = async () => {
    if (!registerName.trim()) { alert('Please enter a name first.'); return; }
    setStatusMessage('Capturing facial mapping...');

    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (result) {
      const descriptorArray = Array.from(result.descriptor);
      const newFace = {
        label: registerName.trim(),
        descriptors: [descriptorArray],
        registeredAt: new Date().toLocaleString('en-IN', {
          year: 'numeric', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }),
      };
      const updatedFaces = [...registeredFaces, newFace];
      setRegisteredFaces(updatedFaces);
      localStorage.setItem('registeredFaces', JSON.stringify(updatedFaces));
      setStatusMessage(`✅ Successfully registered ${registerName.trim()}!`);
      setRegisterName('');
      setTimeout(() => setMode('scan'), 2000);
    } else {
      setStatusMessage('No face detected. Please try again.');
    }
  };

  const handleClearFaces = () => {
    if (window.confirm('Delete ALL registered faces?')) {
      setRegisteredFaces([]);
      localStorage.removeItem('registeredFaces');
      setStatusMessage('All registered faces cleared.');
    }
  };

  // Re-trigger scan loop when switching back to scan mode
  useEffect(() => {
    if (mode === 'scan' && modelsLoaded && videoRef.current && !videoRef.current.paused) {
      scanLoop();
    }
    if (mode === 'register') {
      setStatusMessage('Position face clearly in camera.');
      if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {mode === 'scan' ? <ScanFace size={32} className="text-primary" /> : <UserPlus size={32} className="text-secondary" />}
          <h2>{mode === 'scan' ? 'Security Portal' : 'Register New User'}</h2>
        </div>

        <div className="video-wrapper">
          {!modelsLoaded && (
            <div className="loading-overlay">
              <Loader2 className="spinner" size={48} />
              <p>{statusMessage}</p>
            </div>
          )}
          <video ref={videoRef} onPlay={handleVideoPlay} autoPlay muted playsInline className="webcam-video" />
          <canvas ref={canvasRef} className="webcam-canvas" />
          {mode === 'scan' && <div className="scan-line" />}
          <div className="scanner-bracket tl" />
          <div className="scanner-bracket tr" />
          <div className="scanner-bracket bl" />
          <div className="scanner-bracket br" />
        </div>

        <div className={`status-bar ${statusMessage.includes('CRITICAL') ? 'status-critical' : statusMessage.includes('Denied') ? 'status-error' : ''}`}>
          <ShieldAlert size={18} />
          <span>{statusMessage}</span>
        </div>

        {mode === 'register' && (
          <div className="register-panel">
            <input
              type="text"
              placeholder="Enter Authorized Name"
              value={registerName}
              onChange={e => setRegisterName(e.target.value)}
              className="name-input"
            />
            <button onClick={handleRegisterFace} className="btn-primary">
              <Camera size={18} /> Capture Face
            </button>
            <button onClick={handleClearFaces} className="btn-text" style={{ color: '#ef4444', marginTop: '10px' }}>
              Clear All Registered Faces
            </button>
          </div>
        )}

        <div className="auth-footer">
          {mode === 'scan' ? (
            <div className="auth-footer-actions">
              <button className="btn-text" onClick={() => setMode('register')}>
                Register New Face
              </button>
              <span className="footer-divider">|</span>
              <button className="btn-admin-link" onClick={onAdminClick}>
                <KeyRound size={14} /> Admin Login
              </button>
            </div>
          ) : (
            <button className="btn-text" onClick={() => { setMode('scan'); setStatusMessage('Scanning for Authorized Personnel...'); }}>
              ← Back to Security Portal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceAuth;
