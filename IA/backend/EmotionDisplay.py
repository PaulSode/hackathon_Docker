"""
Module pour le formatage et l'enrichissement des prédictions d'émotions.
Ce module fournit des fonctions pour traiter les prédictions brutes du modèle
et les enrichir avec des informations supplémentaires utiles pour l'affichage.
"""

import numpy as np
from typing import Dict, List, Tuple, Any

# Mapping des émotions en français
EMOTION_LABELS = {
    'angry': 'Colère',
    'disgust': 'Dégoût',
    'fear': 'Peur',
    'happy': 'Joie',
    'neutral': 'Neutre',
    'sad': 'Tristesse',
    'surprise': 'Surprise'
}

# Descriptions détaillées des émotions
EMOTION_DESCRIPTIONS = {
    'angry': "La colère est une émotion intense qui se manifeste face à une menace, une frustration ou une injustice.",
    'disgust': "Le dégoût est une émotion qui nous protège contre les substances ou situations potentiellement nocives.",
    'fear': "La peur est un mécanisme de survie qui nous alerte d'un danger potentiel.",
    'happy': 'La joie est une émotion positive associée au plaisir, au contentement et au bonheur.',
    'neutral': "L'expression neutre ne montre pas d'émotion particulière.",
    'sad': "La tristesse est souvent liée à une perte ou à une déception.",
    'surprise': "La surprise est une réaction brève à un événement inattendu."
}

# Conseils associés à chaque émotion
EMOTION_TIPS = {
    'angry': [
        "Prenez quelques respirations profondes",
        "Essayez de vous distraire avec une activité apaisante",
        "Exprimez vos sentiments de façon constructive"
    ],
    'disgust': [
        "Éloignez-vous de la source du dégoût si possible",
        "Concentrez-vous sur des pensées ou des images positives",
        "Rappelez-vous que le dégoût est un mécanisme de protection"
    ],
    'fear': [
        "Pratiquez des exercices de respiration",
        "Identifiez ce qui vous fait peur et confrontez-le progressivement",
        "Parlez à quelqu'un de confiance de vos peurs"
    ],
    'happy': [
        'Savourez ce moment de bonheur',
        "Partagez votre joie avec d'autres personnes",
        "Notez ce moment dans un journal pour vous en souvenir"
    ],
    'neutral': [
        "C'est un bon moment pour la pleine conscience",
        "Réfléchissez à votre journée",
        "Prenez un moment pour vous recentrer"
    ],
    'sad': [
        "Permettez-vous de ressentir cette émotion",
        "Parlez à un ami ou à un professionnel",
        "Faites une activité que vous aimez pour vous remonter le moral"
    ],
    'surprise': [
        "Prenez un moment pour intégrer l'information inattendue",
        "Respirez profondément si nécessaire",
        "Utilisez cette énergie pour être créatif"
    ]
}

def format_prediction(prediction: np.ndarray, emotion_labels: List[str]) -> Dict[str, Any]:
    """
    Formate les prédictions brutes du modèle en un dictionnaire structuré.
    
    Args:
        prediction (np.ndarray): Tableau de prédictions du modèle
        emotion_labels (List[str]): Liste des étiquettes d'émotions
        
    Returns:
        Dict[str, Any]: Dictionnaire formaté des prédictions
    """
    # Récupérer l'indice de la classe prédite
    predicted_class = np.argmax(prediction[0])
    predicted_emotion = emotion_labels[predicted_class]
    confidence = float(prediction[0][predicted_class])
    
    # Créer un dictionnaire avec toutes les prédictions
    all_predictions = {emotion: float(pred) for emotion, pred in zip(emotion_labels, prediction[0])}
    
    # Ajouter des informations supplémentaires
    formatted_result = {
        "prediction": predicted_emotion,
        "confidence": confidence,
        "all_predictions": all_predictions,
        "label_fr": EMOTION_LABELS.get(predicted_emotion, predicted_emotion),
        "description": EMOTION_DESCRIPTIONS.get(predicted_emotion, ""),
        "tips": EMOTION_TIPS.get(predicted_emotion, [])
    }
    
    return formatted_result

def get_emotion_history(history: List[Dict[str, Any]], max_entries: int = 10) -> List[Dict[str, Any]]:
    """
    Prépare l'historique des émotions détectées pour l'affichage.
    
    Args:
        history (List[Dict[str, Any]]): Historique des prédictions
        max_entries (int, optional): Nombre maximum d'entrées à retourner
        
    Returns:
        List[Dict[str, Any]]: Historique formaté
    """
    # Limitez l'historique au nombre maximum d'entrées
    limited_history = history[-max_entries:] if len(history) > max_entries else history
    
    # Ajouter des informations supplémentaires à chaque entrée
    formatted_history = []
    for entry in limited_history:
        emotion = entry.get("prediction", "")
        formatted_entry = {
            **entry,
            "label_fr": EMOTION_LABELS.get(emotion, emotion),
            "timestamp_formatted": entry.get("timestamp", "").strftime("%H:%M:%S")
        }
        formatted_history.append(formatted_entry)
    
    return formatted_history

def get_dominant_emotion(history: List[Dict[str, Any]], window_size: int = 10) -> str:
    """
    Détermine l'émotion dominante sur une fenêtre d'historique.
    
    Args:
        history (List[Dict[str, Any]]): Historique des prédictions
        window_size (int, optional): Taille de la fenêtre d'analyse
        
    Returns:
        str: Émotion dominante
    """
    if not history:
        return "neutral"
        
    # Limitez l'historique à la taille de la fenêtre
    recent_history = history[-window_size:] if len(history) > window_size else history
    
    # Comptez les occurrences de chaque émotion
    emotion_counts = {}
    for entry in recent_history:
        emotion = entry.get("prediction", "")
        if emotion in emotion_counts:
            emotion_counts[emotion] += 1
        else:
            emotion_counts[emotion] = 1
    
    # Trouvez l'émotion la plus fréquente
    dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "neutral"
    
    return dominant_emotion

def get_emotion_transition(current: str, previous: str) -> Dict[str, Any]:
    """
    Analyse la transition entre deux émotions consécutives.
    
    Args:
        current (str): Émotion actuelle
        previous (str): Émotion précédente
        
    Returns:
        Dict[str, Any]: Informations sur la transition
    """
    # Définir des catégories d'émotions
    positive_emotions = ["happy", "surprise"]
    negative_emotions = ["angry", "disgust", "fear", "sad"]
    neutral_emotions = ["neutral"]
    
    # Déterminer le type de transition
    if current == previous:
        transition_type = "stable"
        message = "Émotion stable"
    elif current in positive_emotions and previous in negative_emotions:
        transition_type = "improvement"
        message = "Amélioration de l'humeur"
    elif current in negative_emotions and previous in positive_emotions:
        transition_type = "deterioration"
        message = "Détérioration de l'humeur"
    elif current in neutral_emotions and previous not in neutral_emotions:
        transition_type = "neutralization"
        message = "Retour à un état neutre"
    else:
        transition_type = "change"
        message = "Changement d'émotion"
    
    return {
        "type": transition_type,
        "message": message,
        "from": previous,
        "to": current
    }