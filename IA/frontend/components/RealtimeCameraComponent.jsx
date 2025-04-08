'use client';

import { useState, useRef, useEffect } from 'react';

const RealtimeCameraComponent = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const captureIntervalRef = useRef(null);
  
  // Vous pouvez ajuster cette valeur pour modifier l'intervalle entre les analyses (en millisecondes)
  // 5000 = 5 secondes entre chaque analyse
  const CAPTURE_INTERVAL = 5000;

  // Initialisation de la caméra
  useEffect(() => {
    async function setupCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user', 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          },
          audio: false,
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        // Démarrer la capture automatique avec un délai initial pour laisser la caméra s'initialiser
        setTimeout(() => {
          startCaptureInterval();
        }, 1000);
      } catch (err) {
        console.error('Erreur d\'accès à la caméra:', err);
        setCameraError(`Impossible d'accéder à la caméra: ${err.message}`);
      }
    }

    if (cameraActive) {
      setupCamera();
    }

    // Nettoyage
    return () => {
      stopCaptureInterval();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  // Démarrer la capture à intervalles réguliers
  const startCaptureInterval = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    
    // Faire une capture immédiate
    if (!isAnalyzing) {
      captureImage();
    }
    
    // Puis configurer l'intervalle avec le nouveau délai
    captureIntervalRef.current = setInterval(() => {
      if (!isAnalyzing) {
        captureImage();
      }
    }, CAPTURE_INTERVAL);
  };

  // Arrêter la capture à intervalles réguliers
  const stopCaptureInterval = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  // Effet pour pauser et reprendre l'intervalle selon l'état d'analyse
  useEffect(() => {
    if (isAnalyzing) {
      // Si une analyse est en cours, pauser l'intervalle
      stopCaptureInterval();
    } else if (cameraActive && !captureIntervalRef.current) {
      // Si la caméra est active et qu'aucun intervalle n'est en cours, le redémarrer
      startCaptureInterval();
    }
  }, [isAnalyzing]);

  // Activer/désactiver la caméra
  const toggleCamera = () => {
    if (cameraActive) {
      stopCaptureInterval();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setCameraActive(!cameraActive);
  };

  // Basculer en mode plein écran
  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    
    if (!document.fullscreenElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Fonction pour capturer une image avec compte à rebours
  const captureWithCountdown = () => {
    if (!videoRef.current || !cameraActive) return;
    
    // Arrêter l'intervalle automatique pendant le compte à rebours
    stopCaptureInterval();
    
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          captureImage();
          // Redémarrer l'intervalle après la capture manuelle
          setTimeout(startCaptureInterval, 1000);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Fonction pour capturer une image du flux vidéo
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Définir les dimensions du canvas pour correspondre à la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir en base64
    const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
    
    // Envoyer l'image au parent pour traitement
    onCapture(imageSrc);
  };

  // Détecter quand on quitte le mode plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="relative h-full">
      {cameraError ? (
        <div className="h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-red-500 bg-opacity-90 text-white p-5 rounded-lg max-w-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mb-3">{cameraError}</p>
            <button 
              onClick={() => setCameraActive(true)}
              className="px-4 py-2 bg-white text-red-500 rounded-lg font-medium transition-colors hover:bg-gray-100"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full">
          <div className="relative h-full bg-black rounded-lg overflow-hidden">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full bg-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Caméra désactivée</p>
                </div>
              </div>
            )}
            
            {/* Overlay pour l'analyse */}
            {isAnalyzing && (
              <div className="absolute inset-0 border-4 border-white border-opacity-50 animate-pulse rounded-lg"></div>
            )}
            
            {/* Affichage du compte à rebours */}
            {countdown && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                <div className="text-white text-6xl font-bold animate-pulse">
                  {countdown}
                </div>
              </div>
            )}
            
            {/* Boutons de contrôle */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                onClick={toggleCamera}
                className="bg-black bg-opacity-60 hover:bg-opacity-80 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                title={cameraActive ? "Désactiver la caméra" : "Activer la caméra"}
              >
                {cameraActive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="bg-black bg-opacity-60 hover:bg-opacity-80 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              >
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v4a1 1 0 01-1 1H1a1 1 0 010-2h1V5a3 3 0 013-3h4a1 1 0 010 2H5zm10 10h-1.586l2.293-2.293a1 1 0 00-1.414-1.414L12 12.586V11a1 1 0 00-2 0v3a1 1 0 001 1h4a1 1 0 000-2zm-9 0a1 1 0 001 1h4a1 1 0 001-1v-3a1 1 0 00-2 0v1.586l-2.293-2.293a1 1 0 00-1.414 1.414L8.586 14H5a1 1 0 000 2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={captureWithCountdown}
                className="bg-black bg-opacity-60 hover:bg-opacity-80 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                title="Capturer une photo (avec compte à rebours)"
                disabled={isAnalyzing || !cameraActive || countdown !== null}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.5a1 1 0 01-.8-.4l-.9-1.2A2 2 0 0011 3H9a2 2 0 00-1.8 1.1L6.3 5.6a1 1 0 01-.8.4H4zm.5 2a.5.5 0 00-.5.5v8a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-8a.5.5 0 00-.5-.5h-11zM10 15a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </button>
            </div>
            
            {/* Indicateur de statut de l'analyse */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <div className={`px-3 py-1 rounded-full text-xs flex items-center ${isAnalyzing ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isAnalyzing ? 'animate-pulse bg-white' : 'bg-white'}`}></div>
                {isAnalyzing ? "Analyse..." : "Prêt"}
              </div>
              
              {cameraActive && !isAnalyzing && (
                <div className="bg-black bg-opacity-60 px-3 py-1 rounded-full text-xs text-white">
                  Analyse toutes les {CAPTURE_INTERVAL/1000}s
                </div>
              )}
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default RealtimeCameraComponent;