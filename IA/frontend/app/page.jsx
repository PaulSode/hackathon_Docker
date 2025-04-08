'use client';

import { useState, useRef, useEffect } from 'react';
import { API_URL } from '../utils/config';

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const captureIntervalRef = useRef(null);

  // Traduction des émotions en français
  const emotionLabels = {
    'angry': 'Colère',
    'disgust': 'Dégoût',
    'fear': 'Peur',
    'happy': 'Joie',
    'neutral': 'Neutre',
    'sad': 'Tristesse',
    'surprise': 'Surprise'
  };

  // Map des icônes emoji pour chaque émotion
  const emotionEmojis = {
    'angry': '😠',
    'disgust': '🤢',
    'fear': '😨',
    'happy': '😃',
    'neutral': '😐',
    'sad': '😢',
    'surprise': '😲'
  };

  // Initialisation de la caméra
  useEffect(() => {
    async function setupCamera() {
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false,
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        // Démarrer la capture automatique avec un délai
        setTimeout(() => {
          startCaptureInterval();
        }, 1000);
      } catch (err) {
        console.error('Erreur d\'accès à la caméra:', err);
        setError(`Impossible d'accéder à la caméra: ${err.message}`);
      }
    }

    setupCamera();

    // Nettoyage
    return () => {
      stopCaptureInterval();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Démarrer la capture à intervalles réguliers (5 secondes)
  const startCaptureInterval = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    
    // Faire une capture immédiate
    if (!isAnalyzing) {
      captureImage();
    }
    
    // Configurer l'intervalle
    captureIntervalRef.current = setInterval(() => {
      if (!isAnalyzing) {
        captureImage();
      }
    }, 5000);
  };

  // Arrêter la capture à intervalles réguliers
  const stopCaptureInterval = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

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
    const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
    
    // Envoyer l'image au backend
    analyzeImage(imageSrc);
  };

  // Fonction pour analyser l'image
  const analyzeImage = async (imageSrc) => {
    try {
      if (isAnalyzing) return;

      setIsAnalyzing(true);
      setError(null);
      
      // Envoyer l'image au backend
      const response = await fetch(`${API_URL}/predict-base64/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.prediction === "Aucun visage détecté") {
        setError("Aucun visage détecté");
      } else {
        setPrediction(result);
      }
    } catch (err) {
      console.error('Erreur lors de la prédiction:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Obtenir la couleur de fond en fonction de l'émotion
  const getEmotionBackground = () => {
    if (!prediction) return 'bg-gray-900';
    
    const backgrounds = {
      'angry': 'bg-red-800',
      'disgust': 'bg-purple-800',
      'fear': 'bg-yellow-800',
      'happy': 'bg-green-700',
      'neutral': 'bg-gray-700',
      'sad': 'bg-blue-800',
      'surprise': 'bg-pink-700'
    };
    
    return backgrounds[prediction.prediction] || 'bg-gray-900';
  };

  return (
    <div className={`min-h-screen ${getEmotionBackground()} flex flex-col items-center justify-center p-4 transition-colors duration-700`}>
      <h1 className="text-3xl font-bold text-white mb-8">Détecteur d'Émotions</h1>
      
      <div className="max-w-4xl w-full">
        {/* Vidéo et résultat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vidéo */}
          <div className="bg-black rounded-lg overflow-hidden shadow-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
            />
            
            {isAnalyzing && (
              <div className="relative mt-2 px-4 py-2">
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  <span className="text-white text-sm">Analyse en cours...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-2 bg-red-500 text-white p-2 text-center text-sm rounded">
                {error}
              </div>
            )}
          </div>
          
          {/* Résultat */}
          <div className="bg-black bg-opacity-30 rounded-lg overflow-hidden shadow-xl p-6 flex flex-col items-center justify-center">
            {prediction ? (
              <div className="text-center">
                <div className="text-8xl mb-4">
                  {emotionEmojis[prediction.prediction] || '❓'}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {emotionLabels[prediction.prediction] || prediction.prediction}
                </h2>
                <p className="text-white text-opacity-80">
                  Confiance: {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
            ) : (
              <div className="text-center text-white text-opacity-80">
                <div className="text-6xl mb-4">😶</div>
                <p>En attente de détection...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Message d'instruction */}
        <p className="text-white text-opacity-70 text-center mt-6">
          Regardez la caméra pour que l'IA puisse analyser votre expression faciale. L'analyse se fait automatiquement toutes les 5 secondes.
        </p>
      </div>
      
      {/* Canvas caché pour la capture d'image */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}