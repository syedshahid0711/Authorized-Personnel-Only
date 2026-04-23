import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, UserPlus, ScanFace, Loader2, ShieldAlert } from 'lucide-react';

const FaceAuth = ({ onAuthSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [mode, setMode] = useState('scan'); // 'scan' or 'register'
  const [registerName, setRegisterName] = useState('');
  const [statusMessage, setStatusMessage] = useState('Loading AI Models...');
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [, setFailedAttempts] = useState(0);

  const faceMatcherRef = useRef(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    faceMatcherRef.current = faceMatcher;
  }, [faceMatcher]);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        setStatusMessage('Starting Webcam...');
        startVideo();
        loadRegisteredFaces();
      } catch (err) {
        console.error("Error loading models:", err);
        setStatusMessage('Error loading AI models.');
      }
    };
    loadModels();
  }, []);

  // Setup FaceMatcher when registeredFaces change
  useEffect(() => {
    if (registeredFaces.length > 0) {
      const labeledDescriptors = registeredFaces.map(rf => {
        // Convert plain arrays back to Float32Arrays
        const descriptors = rf.descriptors.map(d => new Float32Array(Object.values(d)));
        return new faceapi.LabeledFaceDescriptors(rf.label, descriptors);
      });
      setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.38));
    } else {
      setFaceMatcher(null);
    }
  }, [registeredFaces]);

  const loadRegisteredFaces = () => {
    const stored = localStorage.getItem('registeredFaces');
    if (stored) {
      setRegisteredFaces(JSON.parse(stored));
    }
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
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

    const result = await faceapi.detectSingleFace(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptor();

    if (result) {
      // Draw detection
      if (canvasRef.current && videoRef.current) {
        const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetections = faceapi.resizeResults(result, displaySize);
        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      }

      if (faceMatcherRef.current) {
        const bestMatch = faceMatcherRef.current.findBestMatch(result.descriptor);
        if (bestMatch.label !== 'unknown') {
          setFailedAttempts(0);
          setStatusMessage(`Match Found: ${bestMatch.label}! Authenticating...`);
          setTimeout(() => {
            if (videoRef.current && videoRef.current.srcObject) {
              videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
            onAuthSuccess(bestMatch.label);
          }, 1500);
          return; // Stop scanning
        } else {
          setFailedAttempts(prev => {
            const newCount = prev + 1;
            if (newCount >= 15) {
              setStatusMessage('⚠️ CRITICAL: SECURITY BREACH. AUTHORITIES ALERTED! ⚠️');
            } else {
              setStatusMessage('Access Denied. Face not recognized.');
            }
            return newCount;
          });
        }
      } else {
        setStatusMessage('No registered faces found in database.');
      }
    } else {
      // clear canvas
      setFailedAttempts(0);
      if (canvasRef.current) {
        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setStatusMessage('Scanning for Authorized Personnel...');
    }

    setTimeout(() => scanLoop(), 200);
  };

  const handleRegisterFace = async () => {
    if (!registerName.trim()) {
      alert("Please enter a name first.");
      return;
    }
    setStatusMessage('Capturing facial mapping...');

    const result = await faceapi.detectSingleFace(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptor();

    if (result) {
      // Convert Float32Array to regular array for JSON storage
      const descriptorArray = Array.from(result.descriptor);
      const newFace = {
        label: registerName.trim(),
        descriptors: [descriptorArray]
      };

      const updatedFaces = [...registeredFaces, newFace];
      setRegisteredFaces(updatedFaces);
      localStorage.setItem('registeredFaces', JSON.stringify(updatedFaces));

      setStatusMessage(`Successfully registered ${registerName}!`);
      setRegisterName('');
      setTimeout(() => {
        setMode('scan');
      }, 2000);
    } else {
      setStatusMessage('No face detected. Please try again.');
    }
  };

  const handleClearFaces = () => {
    if (window.confirm("Are you sure you want to delete all registered faces?")) {
      setRegisteredFaces([]);
      localStorage.removeItem('registeredFaces');
      setStatusMessage('All registered faces have been cleared.');
    }
  };

  // Re-trigger loop when switching back to scan mode
  useEffect(() => {
    if (mode === 'scan' && modelsLoaded && videoRef.current && !videoRef.current.paused) {
      scanLoop();
    }
    if (mode === 'register') {
      setStatusMessage('Position face clearly in camera.');
      if (canvasRef.current) {
        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
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
          <video
            ref={videoRef}
            onPlay={handleVideoPlay}
            autoPlay
            muted
            playsInline
            className="webcam-video"
          />
          <canvas ref={canvasRef} className="webcam-canvas" />
          {mode === 'scan' && <div className="scan-line"></div>}
          <div className="scanner-bracket tl"></div>
          <div className="scanner-bracket tr"></div>
          <div className="scanner-bracket bl"></div>
          <div className="scanner-bracket br"></div>
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
              onChange={(e) => setRegisterName(e.target.value)}
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
            <button className="btn-text" onClick={() => setMode('register')}>
              Admin: Register New Face
            </button>
          ) : (
            <button className="btn-text" onClick={() => {
              setMode('scan');
              setStatusMessage('Scanning for Authorized Personnel...');
            }}>
              Back to Security Portal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceAuth;

