import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { ScanFace, Loader2, ShieldAlert, KeyRound } from 'lucide-react';

const FaceAuth = ({ onAuthSuccess, onAdminClick }) => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading AI Models...');
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [faceMatcher,     setFaceMatcher]     = useState(null);
  const failedAttemptsRef = useRef(0);
  const faceMatcherRef    = useRef(null);
  const activeRef         = useRef(true);

  useEffect(() => { faceMatcherRef.current = faceMatcher; }, [faceMatcher]);

  useEffect(() => {
    activeRef.current = true;
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
      } catch {
        setStatusMessage('Error loading AI models.');
      }
    };
    loadModels();
    return () => {
      activeRef.current = false;
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild FaceMatcher whenever faces list changes
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
      .catch(() => setStatusMessage('Webcam access denied.'));
  };

  const handleVideoPlay = () => {
    setStatusMessage('Scanning for Authorized Personnel...');
    scanLoop();
  };

  const scanLoop = async () => {
    if (!activeRef.current || !videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (result) {
      if (canvasRef.current && videoRef.current) {
        const size = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvasRef.current, size);
        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, faceapi.resizeResults(result, size));
      }

      if (faceMatcherRef.current) {
        const best = faceMatcherRef.current.findBestMatch(result.descriptor);
        if (best.label !== 'unknown') {
          failedAttemptsRef.current = 0;
          setStatusMessage(`Match Found: ${best.label}! Authenticating...`);
          setTimeout(() => {
            if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            onAuthSuccess(best.label);
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
        setStatusMessage('No registered faces in database. Contact admin.');
      }
    } else {
      failedAttemptsRef.current = 0;
      if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setStatusMessage('Scanning for Authorized Personnel...');
    }

    if (activeRef.current) setTimeout(() => scanLoop(), 200);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <ScanFace size={32} className="text-primary" />
          <h2>Security Portal</h2>
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
          <div className="scan-line" />
          <div className="scanner-bracket tl" /><div className="scanner-bracket tr" />
          <div className="scanner-bracket bl" /><div className="scanner-bracket br" />
        </div>

        <div className={`status-bar ${
          statusMessage.includes('CRITICAL') ? 'status-critical'
          : statusMessage.includes('Denied') ? 'status-error' : ''
        }`}>
          <ShieldAlert size={18} />
          <span>{statusMessage}</span>
        </div>

        <div className="auth-footer">
          <div className="auth-footer-actions">
            <button className="btn-admin-link" onClick={onAdminClick}>
              <KeyRound size={14} /> Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceAuth;
