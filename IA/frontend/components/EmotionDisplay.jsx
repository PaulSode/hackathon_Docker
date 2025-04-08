'use client';

import React, { useState } from 'react';

// Map des émotions en français pour l'affichage
const emotionLabels = {
  'angry': 'Colère',
  'disgust': 'Dégoût',
  'fear': 'Peur',
  'happy': 'Joie',
  'neutral': 'Neutre',
  'sad': 'Tristesse',
  'surprise': 'Surprise'
};

// Map des couleurs pour chaque émotion
const emotionColors = {
  'angry': 'bg-red-500',
  'disgust': 'bg-purple-500',
  'fear': 'bg-yellow-500',
  'happy': 'bg-green-500',
  'neutral': 'bg-gray-500',
  'sad': 'bg-blue-500',
  'surprise': 'bg-pink-500'
};

// Map des descriptions pour chaque émotion
const emotionDescriptions = {
  'angry': "La colère est une émotion intense qui se manifeste face à une menace, une frustration ou une injustice.",
  'disgust': "Le dégoût est une émotion qui nous protège contre les substances ou situations potentiellement nocives.",
  'fear': "La peur est un mécanisme de survie qui nous alerte d'un danger potentiel.",
  'happy': "La joie est une émotion positive associée au plaisir, au contentement et au bonheur.",
  'neutral': "L'expression neutre ne montre pas d'émotion particulière.",
  'sad': "La tristesse est souvent liée à une perte ou à une déception.",
  'surprise': "La surprise est une réaction brève à un événement inattendu."
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

// Conseils pour chaque émotion
const emotionTips = {
  'angry': [
    "Prenez quelques respirations profondes et lentes",
    "Éloignez-vous temporairement de la situation",
    "Essayez de vous exprimer calmement et clairement",
    "Faites de l'exercice physique pour évacuer la tension"
  ],
  'disgust': [
    "Détournez votre attention vers quelque chose d'agréable",
    "Rappelez-vous que cette réaction est temporaire",
    "Identifiez précisément ce qui provoque ce dégoût",
    "Tentez de relativiser la situation"
  ],
  'fear': [
    "Pratiquez une respiration contrôlée et consciente",
    "Nommez précisément ce qui vous fait peur",
    "Rappelez-vous des situations similaires surmontées",
    "Concentrez-vous sur ce que vous pouvez contrôler"
  ],
  'happy': [
    "Savourez pleinement ce moment de joie",
    "Exprimez votre gratitude pour cette émotion positive",
    "Partagez ce bonheur avec quelqu'un d'autre",
    "Notez ce qui vous rend heureux pour vous en souvenir"
  ],
  'neutral': [
    "C'est un bon moment pour pratiquer la pleine conscience",
    "Profitez de cet équilibre émotionnel pour réfléchir",
    "Observez votre environnement avec attention",
    "Prenez un moment pour vous recentrer"
  ],
  'sad': [
    "Accordez-vous le droit de ressentir cette tristesse",
    "Parlez de vos sentiments à une personne de confiance",
    "Faites une activité qui vous réconforte habituellement",
    "Rappelez-vous que cette émotion n'est pas permanente"
  ],
  'surprise': [
    "Prenez un moment pour assimiler l'information inattendue",
    "Explorez cette nouvelle perspective avec curiosité",
    "Utilisez cette énergie pour être créatif",
    "Considérez comment intégrer cet élément surprise"
  ]
};

const EmotionDisplay = ({ prediction, light = false }) => {
  const [selectedTab, setSelectedTab] = useState('emotion'); // 'emotion' ou 'tips'

  if (!prediction || !prediction.all_predictions) {
    return null;
  }

  const { prediction: predictedEmotion, confidence, all_predictions } = prediction;
  
  // Formatter les prédictions pour l'affichage
  const formattedPredictions = Object.entries(all_predictions)
    .map(([emotion, score]) => ({
      emotion,
      score,
      label: emotionLabels[emotion] || emotion,
      color: emotionColors[emotion] || 'bg-gray-500',
      emoji: emotionEmojis[emotion] || '❓',
      description: emotionDescriptions[emotion] || '',
      tips: emotionTips[emotion] || []
    }))
    .sort((a, b) => b.score - a.score);
  
  const topPrediction = formattedPredictions[0];
  const confidencePercent = (topPrediction.score * 100).toFixed(1);
  const textColor = light ? 'text-white' : 'text-gray-800';
  const mutedTextColor = light ? 'text-white text-opacity-80' : 'text-gray-600';
  const activeTabClass = light ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-100 text-gray-800';
  const inactiveTabClass = light ? 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10' : 'text-gray-500 hover:bg-gray-50';

  return (
    <div className="flex flex-col h-full">
      <div className={`mb-4 rounded-lg overflow-hidden ${light ? 'ring-1 ring-white ring-opacity-10' : 'border border-gray-200'}`}>
        {/* Onglets */}
        <div className="flex">
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-all ${selectedTab === 'emotion' ? activeTabClass : inactiveTabClass}`}
            onClick={() => setSelectedTab('emotion')}
          >
            <span className="flex items-center justify-center">
              <span className="mr-1">{topPrediction.emoji}</span> Émotion
            </span>
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-all ${selectedTab === 'tips' ? activeTabClass : inactiveTabClass}`}
            onClick={() => setSelectedTab('tips')}
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Conseils
            </span>
          </button>
        </div>

        {/* Contenu de l'onglet */}
        <div className={`p-4 ${light ? 'bg-black bg-opacity-20' : 'bg-white'}`}>
          {selectedTab === 'emotion' && (
            <div className="flex flex-col">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{topPrediction.emoji}</div>
                <h3 className={`text-xl font-bold mb-1 ${textColor}`}>{topPrediction.label}</h3>
                <p className={`text-sm font-medium ${mutedTextColor}`}>
                  {confidencePercent}% de confiance
                </p>
              </div>
              
              <p className={`text-sm mb-4 ${mutedTextColor}`}>
                {topPrediction.description}
              </p>
              
              <h4 className={`text-sm font-medium mb-2 ${textColor}`}>Détails de l'analyse:</h4>
              
              <div className="space-y-2">
                {formattedPredictions.slice(0, 3).map((item) => (
                  <div key={item.emotion} className="flex items-center">
                    <div className="mr-2 w-6 text-center">{item.emoji}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className={`text-xs font-medium ${textColor}`}>{item.label}</span>
                        <span className={`text-xs ${mutedTextColor}`}>
                          {(item.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className={`w-full ${light ? 'bg-white bg-opacity-20' : 'bg-gray-200'} rounded-full h-1.5`}>
                        <div 
                          className={`h-1.5 rounded-full ${item.color}`} 
                          style={{ width: `${item.score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'tips' && (
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{topPrediction.emoji}</div>
                <div>
                  <h3 className={`text-lg font-bold ${textColor}`}>
                    Conseils pour la {topPrediction.label.toLowerCase()}
                  </h3>
                  <p className={`text-xs ${mutedTextColor}`}>
                    Pour vous aider à gérer cette émotion
                  </p>
                </div>
              </div>
              
              <ul className="space-y-2">
                {topPrediction.tips.map((tip, index) => (
                  <li key={index} className={`flex items-start ${light ? 'text-white' : 'text-gray-700'}`}>
                    <div className={`mr-2 mt-0.5 flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full ${light ? 'bg-white bg-opacity-20' : 'bg-gray-100'} text-xs`}>
                      {index + 1}
                    </div>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionDisplay;