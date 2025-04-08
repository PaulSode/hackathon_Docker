# main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import cv2
from mtcnn import MTCNN
import base64
import io
from PIL import Image
import uvicorn
from datetime import datetime
from EmotionDisplay import format_prediction, get_emotion_history, get_dominant_emotion

app = FastAPI()

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Autorise le frontend IA
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chargement du modèle au démarrage du serveur
model = None
detector = None
emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
emotion_history = []  # Pour stocker l'historique des émotions détectées

@app.on_event("startup")
async def startup_event():
    global model, detector
    # Chargement du modèle
    model = tf.keras.models.load_model("best_model.h5")
    # Initialisation du détecteur de visages MTCNN
    detector = MTCNN()
    print("Modèle et détecteur chargés avec succès.")

@app.get("/")
def read_root():
    return {"message": "API de reconnaissance d'émotions faciales", "version": "1.0"}

@app.get("/emotions")
def get_emotions():
    """Renvoie la liste des émotions que le modèle peut détecter"""
    return {
        "emotions": emotion_labels,
        "count": len(emotion_labels)
    }

@app.get("/history")
def get_history(limit: int = 10):
    """Renvoie l'historique des émotions détectées"""
    global emotion_history
    return {
        "history": get_emotion_history(emotion_history, limit),
        "dominant_emotion": get_dominant_emotion(emotion_history)
    }

@app.post("/predict/")
async def predict_emotion(file: UploadFile = File(...)):
    global model, detector, emotion_history
    
    if model is None or detector is None:
        raise HTTPException(status_code=500, detail="Le modèle n'est pas chargé")
    
    # Lire et décoder l'image
    contents = await file.read()
    try:
        img = np.array(Image.open(io.BytesIO(contents)))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Impossible de lire l'image: {str(e)}")
    
    # Convertir en RGB si l'image est en RGBA
    if img.shape[-1] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
    
    # Détecter les visages
    try:
        faces = detector.detect_faces(img)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la détection des visages: {str(e)}")
    
    if not faces:
        return {"prediction": "Aucun visage détecté", "confidence": 0.0}
    
    # Prendre le premier visage détecté (celui avec la plus grande confiance)
    face = sorted(faces, key=lambda x: x['confidence'], reverse=True)[0]
    x, y, w, h = face['box']
    
    # Extraire et prétraiter le visage
    face_img = img[y:y+h, x:x+w]
    
    # Redimensionner à 48x48 pixels
    face_img = cv2.resize(face_img, (48, 48))
    
    # Convertir en niveaux de gris
    face_img_gray = cv2.cvtColor(face_img, cv2.COLOR_RGB2GRAY)
    
    # Normaliser les valeurs de pixels entre 0 et 1
    face_img_gray = face_img_gray / 255.0
    
    # Préparer pour l'entrée du modèle
    face_img_gray = np.expand_dims(face_img_gray, axis=-1)  # Ajouter la dimension des canaux
    face_img_gray = np.expand_dims(face_img_gray, axis=0)   # Ajouter la dimension du batch
    
    # Faire la prédiction
    prediction = model.predict(face_img_gray)
    
    # Formater la prédiction avec le module EmotionDisplay
    result = format_prediction(prediction, emotion_labels)
    
    # Créer un rectangle autour du visage
    box_x, box_y, box_w, box_h = face['box']
    face_with_box = img.copy()
    cv2.rectangle(face_with_box, (box_x, box_y), (box_x + box_w, box_y + box_h), (0, 255, 0), 2)
    
    # Ajouter l'émotion en texte au-dessus du rectangle
    font = cv2.FONT_HERSHEY_SIMPLEX
    emotion_text = f"{result['label_fr']}: {(result['confidence']*100):.1f}%"
    cv2.putText(face_with_box, emotion_text, (box_x, box_y - 10), font, 0.9, (255, 255, 255), 2)
    
    # Convertir l'image résultante en base64 pour l'affichage côté client
    _, buffer = cv2.imencode('.jpg', face_with_box)
    face_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Ajouter l'image et l'horodatage au résultat
    result["face_image"] = f"data:image/jpeg;base64,{face_base64}"
    result["timestamp"] = datetime.now().isoformat()
    
    # Ajouter à l'historique
    emotion_history.append(result)
    if len(emotion_history) > 100:  # Limiter la taille de l'historique
        emotion_history = emotion_history[-100:]
    
    return result

@app.post("/predict-base64/")
async def predict_emotion_base64(data: dict):
    global model, detector, emotion_history
    
    if model is None or detector is None:
        raise HTTPException(status_code=500, detail="Le modèle n'est pas chargé")
    
    try:
        # Extraire les données base64 de l'image
        base64_data = data.get("image", "").split(",")[-1]
        img_bytes = base64.b64decode(base64_data)
        img = np.array(Image.open(io.BytesIO(img_bytes)))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Impossible de décoder l'image: {str(e)}")
    
    # Convertir en RGB si l'image est en RGBA
    if len(img.shape) == 3 and img.shape[-1] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
    
    # Détecter les visages
    try:
        faces = detector.detect_faces(img)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la détection des visages: {str(e)}")
    
    if not faces:
        return {"prediction": "Aucun visage détecté", "confidence": 0.0}
    
    # Prendre le premier visage détecté (celui avec la plus grande confiance)
    face = sorted(faces, key=lambda x: x['confidence'], reverse=True)[0]
    x, y, w, h = face['box']
    
    # Extraire et prétraiter le visage
    face_img = img[y:y+h, x:x+w]
    
    # Redimensionner à 48x48 pixels
    face_img = cv2.resize(face_img, (48, 48))
    
    # Convertir en niveaux de gris
    face_img_gray = cv2.cvtColor(face_img, cv2.COLOR_RGB2GRAY)
    
    # Normaliser les valeurs de pixels entre 0 et 1
    face_img_gray = face_img_gray / 255.0
    
    # Préparer pour l'entrée du modèle
    face_img_gray = np.expand_dims(face_img_gray, axis=-1)  # Ajouter la dimension des canaux
    face_img_gray = np.expand_dims(face_img_gray, axis=0)   # Ajouter la dimension du batch
    
    # Faire la prédiction
    prediction = model.predict(face_img_gray)
    
    # Formater la prédiction avec le module EmotionDisplay
    result = format_prediction(prediction, emotion_labels)
    
    # Créer un rectangle autour du visage
    box_x, box_y, box_w, box_h = face['box']
    face_with_box = img.copy()
    cv2.rectangle(face_with_box, (box_x, box_y), (box_x + box_w, box_y + box_h), (0, 255, 0), 2)
    
    # Ajouter l'émotion en texte au-dessus du rectangle
    font = cv2.FONT_HERSHEY_SIMPLEX
    emotion_text = f"{result['label_fr']}: {(result['confidence']*100):.1f}%"
    cv2.putText(face_with_box, emotion_text, (box_x, box_y - 10), font, 0.9, (255, 255, 255), 2)
    
    # Convertir l'image résultante en base64 pour l'affichage côté client
    _, buffer = cv2.imencode('.jpg', face_with_box)
    face_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Ajouter l'image et l'horodatage au résultat
    result["face_image"] = f"data:image/jpeg;base64,{face_base64}"
    result["timestamp"] = datetime.now().isoformat()
    
    # Ajouter à l'historique
    emotion_history.append(result)
    if len(emotion_history) > 100:  # Limiter la taille de l'historique
        emotion_history = emotion_history[-100:]
    
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)