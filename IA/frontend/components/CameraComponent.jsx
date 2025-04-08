// components/CameraComponent.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

const CameraComponent = ({ onCapture, capturing, setCapturing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const captureIntervalRef = useRef(null);

  // Initialisation de la caméra
  useEffect(() => {
    async function setupCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Erreur d\'accès à la caméra:', err);
        setCameraError(`Impossible d'accéder à la caméra: ${err.message}`);
        setCapturing(false);
      }
    }

    setupCamera();

    // Nettoyage
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Gestion de la capture continue
  useEffect(() => {
    if (capturing) {
      // Démarrer la capture continue (toutes les 2 secondes)
      captureIntervalRef.current = setInterval(() => {
        captureImage();
      }, 2000);
    } else {
      // Arrêter la capture continue
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [capturing, onCapture]);

  // Fonction pour capturer une image du flux vidéo
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Définir les dimensions du canvas pour correspondre à la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir en base64
    const imageSrc = canvas.toDataURL('image/jpeg');
    
    // Envoyer l'image au parent pour traitement
    onCapture(imageSrc);
  };

  return (
    <div className="relative">
      {cameraError ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{cameraError}</p>
        </div>
      ) : (
        <div>
          <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg"
            />
            
            {capturing && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  Capture en cours
                </div>
              </div>
            )}
          </div>
          
          <button
            id="captureButton"
            onClick={captureImage}
            className="hidden"
          >
            Capturer
          </button>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default CameraComponent;