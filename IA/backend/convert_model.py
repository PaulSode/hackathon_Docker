import tensorflow as tf
import os
import sys

"""
Ce script convertit un modèle Keras (.h5) en format SavedModel,
qui est généralement plus portable entre différentes versions de TensorFlow.
"""

def convert_model():
    # Vérifier si le fichier du modèle existe
    if not os.path.exists("best_model.h5"):
        print("Erreur: Le fichier 'best_model.h5' n'existe pas dans le répertoire courant.")
        sys.exit(1)
    
    try:
        # Tentative de recréation du modèle
        print("Recréation de l'architecture du modèle...")
        model = tf.keras.Sequential([
            # input layer
            tf.keras.layers.Input(shape=(48,48,1)),  
            tf.keras.layers.Conv2D(64,(3,3), padding='same', activation='relu' ),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D(2,2),
            tf.keras.layers.Dropout(0.25),

            # 1st hidden dense layer
            tf.keras.layers.Conv2D(128,(5,5), padding='same', activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D(2,2),
            tf.keras.layers.Dropout(0.25),

            # 2nd hidden dense layer
            tf.keras.layers.Conv2D(512,(3,3), padding='same', activation='relu',kernel_regularizer=tf.keras.regularizers.l2(0.01)),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D(2,2),
            tf.keras.layers.Dropout(0.25),

            # 3rd hidden dense layer
            tf.keras.layers.Conv2D(512,(3,3), padding='same', activation='relu',kernel_regularizer=tf.keras.regularizers.l2(0.01)),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D(2,2),
            tf.keras.layers.Dropout(0.25),

            # Flatten layer
            tf.keras.layers.Flatten(),

            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.25),

            tf.keras.layers.Dense(512, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.25),

            # output layer
            tf.keras.layers.Dense(7, activation='softmax')
        ])
        
        # Compiler le modèle
        optimizer = tf.keras.optimizers.Adam(learning_rate=0.0001)
        model.compile(optimizer=optimizer,
                      loss='categorical_crossentropy',
                      metrics=['accuracy'])
        
        try:
            # Essayer de charger uniquement les poids
            print("Tentative de chargement des poids...")
            model.load_weights("best_model.h5")
            print("Poids chargés avec succès.")
        except Exception as e:
            print(f"Échec du chargement des poids: {e}")
            
            try:
                # Si échec, tenter de charger le modèle complet
                print("Tentative de chargement du modèle complet...")
                custom_objects = {
                    'BatchNormalization': tf.keras.layers.BatchNormalization
                }
                model = tf.keras.models.load_model("best_model.h5", custom_objects=custom_objects)
                print("Modèle chargé avec succès.")
            except Exception as e2:
                print(f"Échec du chargement du modèle complet: {e2}")
                print("La conversion a échoué. Veuillez vérifier la compatibilité du modèle.")
                sys.exit(1)
        
        # Sauvegarder en format SavedModel
        print("Conversion du modèle en format SavedModel...")
        save_path = "saved_model"
        tf.saved_model.save(model, save_path)
        print(f"Modèle converti et sauvegardé avec succès dans le dossier '{save_path}'")
        
        # Sauvegarder en format TFLite (optionnel - plus léger pour le déploiement)
        print("Conversion du modèle en format TFLite...")
        converter = tf.lite.TFLiteConverter.from_saved_model(save_path)
        tflite_model = converter.convert()
        
        with open("model.tflite", "wb") as f:
            f.write(tflite_model)
        print("Modèle TFLite sauvegardé.")
        
    except Exception as e:
        print(f"Une erreur est survenue lors de la conversion: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Démarrage de la conversion du modèle...")
    convert_model()