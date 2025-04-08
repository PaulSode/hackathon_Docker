import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv2D, BatchNormalization, MaxPooling2D
from tensorflow.keras.layers import Dense, Dropout, Flatten, Activation, add
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, EarlyStopping
from tensorflow.keras.regularizers import l2
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
import pandas as pd

# Contrôler la verbosité de TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Réduire les messages TF

# Définir les chemins des données
train_dir = 'dataset/train'
test_dir = 'dataset/test'

# Paramètres de base
IMG_SIZE = (48, 48)
BATCH_SIZE = 64
EPOCHS = 50
num_classes = 7

# Définir manuellement les poids des classes (équilibrés)
# Ces valeurs sont basées sur la distribution typique des classes dans FER2013
class_weights = {
    0: 1.3,    # angry (sous-représentée)
    1: 3.5,    # disgust (très sous-représentée) 
    2: 1.5,    # fear (sous-représentée)
    3: 0.8,    # happy (surreprésentée)
    4: 0.9,    # neutral (bien représentée)
    5: 1.2,    # sad (représentation moyenne)
    6: 1.3     # surprise (sous-représentée)
}

# Fonction pour créer un bloc résiduel équilibré avec régularisation adaptée
def residual_block(x, filters, kernel_size=3, stride=1, conv_shortcut=False, name=None, dropout_rate=0.0):
    """
    Crée un bloc résiduel avec régularisation adaptée
    Args:
        x: Tenseur d'entrée
        filters: Nombre de filtres pour les couches convolutives
        kernel_size: Taille du noyau pour les couches convolutives
        stride: Pas pour la première couche convolutive
        conv_shortcut: Utiliser un shortcut convolutif si True
        name: Préfixe pour le nom des couches
        dropout_rate: Taux de dropout dans le bloc (si > 0)
    """
    regularizer = l2(0.0005)  # Régularisation modérée équilibrée
    
    if conv_shortcut:
        shortcut = Conv2D(filters, 1, strides=stride, padding='same', 
                          kernel_regularizer=regularizer, name=f'{name}_0_conv')(x)
        shortcut = BatchNormalization(name=f'{name}_0_bn')(shortcut)
    else:
        shortcut = x
    
    # Premier bloc convolutif
    x = Conv2D(filters, kernel_size, strides=stride, padding='same', 
               kernel_regularizer=regularizer, name=f'{name}_1_conv')(x)
    x = BatchNormalization(name=f'{name}_1_bn')(x)
    x = Activation('relu', name=f'{name}_1_relu')(x)
    
    # Dropout optionnel après la première activation
    if dropout_rate > 0:
        x = Dropout(dropout_rate, name=f'{name}_1_dropout')(x)
    
    # Second bloc convolutif
    x = Conv2D(filters, kernel_size, padding='same', 
               kernel_regularizer=regularizer, name=f'{name}_2_conv')(x)
    x = BatchNormalization(name=f'{name}_2_bn')(x)
    
    # Addition de la connexion résiduelle
    x = add([x, shortcut], name=f'{name}_add')
    x = Activation('relu', name=f'{name}_out')(x)
    
    return x

# Fonction pour créer un modèle ResNet équilibré
def create_balanced_resnet(input_shape, num_classes):
    """
    Crée un modèle ResNet équilibré adapté à la reconnaissance d'émotions
    - Moins de filtres au début (32)
    - Progression graduelle de la profondeur (32→64→96→128)
    - Régularisation adaptée à chaque niveau
    - Connexions résiduelles pour stabiliser l'entraînement
    """
    inputs = Input(shape=input_shape)
    regularizer = l2(0.0005)
    
    # Couche d'entrée
    x = Conv2D(32, 3, strides=1, padding='same', kernel_regularizer=regularizer, name='conv1_conv')(inputs)
    x = BatchNormalization(name='conv1_bn')(x)
    x = Activation('relu', name='conv1_relu')(x)
    
    # Premier bloc (moins de filtres - 64)
    x = residual_block(x, 64, conv_shortcut=True, name='block1_unit1')
    x = MaxPooling2D(2, padding='same', name='block1_pool')(x)
    
    # Deuxième bloc (filtres intermédiaires - 96)
    x = residual_block(x, 96, conv_shortcut=True, name='block2_unit1', dropout_rate=0.1)
    x = MaxPooling2D(2, padding='same', name='block2_pool')(x)
    
    # Troisième bloc (plus de filtres - 128)
    x = residual_block(x, 128, conv_shortcut=True, name='block3_unit1', dropout_rate=0.1)
    x = MaxPooling2D(2, padding='same', name='block3_pool')(x)
    
    # Couches de classification progressive
    x = Flatten(name='flatten')(x)
    x = Dense(256, kernel_regularizer=regularizer, name='fc1')(x)
    x = BatchNormalization(name='fc1_bn')(x)
    x = Activation('relu', name='fc1_relu')(x)
    x = Dropout(0.5, name='fc1_dropout')(x)
    outputs = Dense(num_classes, activation='softmax', name='predictions')(x)
    
    # Créer le modèle
    model = Model(inputs, outputs, name='balanced_resnet_emotion')
    
    return model

# Créer les générateurs d'images avec augmentation équilibrée
def create_data_generators():
    """
    Créer les générateurs de données avec augmentation équilibrée
    """
    # Générateur pour l'entraînement avec augmentation modérée
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=15,
        width_shift_range=0.15,
        height_shift_range=0.15,
        horizontal_flip=True,
        zoom_range=0.1,
        brightness_range=[0.9, 1.1],
        validation_split=0.2
    )
    
    # Générateur simple pour les données de test
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Générateurs pour l'entraînement et la validation
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        color_mode="grayscale",
        class_mode="categorical",
        subset="training",
        shuffle=True
    )
    
    validation_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        color_mode="grayscale",
        class_mode="categorical",
        subset="validation",
        shuffle=False
    )
    
    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        color_mode="grayscale",
        class_mode="categorical",
        shuffle=False
    )
    
    return train_generator, validation_generator, test_generator

# Fonction personnalisée de Focal Loss
def get_focal_loss(alpha=0.25, gamma=1.5):
    """
    Focal Loss avec paramètres modérés pour équilibrer l'apprentissage
    - alpha: Facteur de pondération (0.25)
    - gamma: Facteur d'exposition réduit à 1.5 (moins agressif)
    """
    def focal_loss(y_true, y_pred):
        epsilon = 1e-7  # Pour éviter log(0)
        y_pred = tf.clip_by_value(y_pred, epsilon, 1 - epsilon)  # Éviter les valeurs extrêmes
        
        # Cross entropy
        cross_entropy = -y_true * tf.math.log(y_pred)
        
        # Facteur focal (1 - p)^gamma avec gamma modéré
        focal_weight = tf.pow(1 - y_pred, gamma)
        
        # Combiner
        focal_loss = alpha * focal_weight * cross_entropy
        
        # Somme sur les classes et moyenne sur les batch
        return tf.reduce_mean(tf.reduce_sum(focal_loss, axis=-1))
    
    return focal_loss

# Fonction pour visualiser la distribution des classes
def visualize_class_distribution(train_dir):
    """
    Visualise la distribution des classes dans le dataset
    Utile pour comprendre le déséquilibre des classes
    """
    class_counts = {}
    total_samples = 0
    
    # Compter les échantillons par classe
    for class_name in os.listdir(train_dir):
        class_dir = os.path.join(train_dir, class_name)
        if os.path.isdir(class_dir):
            count = len(os.listdir(class_dir))
            class_counts[class_name] = count
            total_samples += count
    
    # Calculer les pourcentages
    class_percentages = {k: (v/total_samples)*100 for k, v in class_counts.items()}
    
    # Visualiser
    plt.figure(figsize=(10, 6))
    bars = plt.bar(class_percentages.keys(), class_percentages.values())
    
    plt.title('Distribution des classes dans le dataset')
    plt.xlabel('Émotion')
    plt.ylabel('Pourcentage (%)')
    plt.xticks(rotation=45)
    
    # Ajouter les valeurs sur les barres
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                 f'{height:.1f}%', ha='center', va='bottom')
    
    plt.tight_layout()
    plt.savefig('class_distribution.png')
    plt.show()

# Programme principal
def main():
    print("Création des générateurs de données...")
    train_generator, validation_generator, test_generator = create_data_generators()
    
    # Afficher les classes
    class_indices = train_generator.class_indices
    class_names = list(class_indices.keys())
    print(f"Classes: {class_names}")
    
    # Visualiser la distribution des classes (optionnel)
    try:
        visualize_class_distribution(train_dir)
    except Exception as e:
        print(f"Impossible de visualiser la distribution (ignoré): {e}")
    
    print("Création du modèle ResNet équilibré...")
    input_shape = (IMG_SIZE[0], IMG_SIZE[1], 1)  # (48, 48, 1) pour images en niveaux de gris
    model = create_balanced_resnet(input_shape, num_classes)
    
    # Compiler le modèle
    print("Compilation du modèle...")
    model.compile(
        optimizer=Adam(learning_rate=0.0005),
        loss=get_focal_loss(alpha=0.25, gamma=1.5),  # Focal Loss avec gamma modéré
        metrics=['accuracy']
    )
    
    # Afficher le résumé du modèle
    model.summary()
    
    # Callbacks pour l'entraînement
    print("Configuration des callbacks...")
    checkpoint = ModelCheckpoint(
        'emotion_balanced_resnet_best.h5',
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )
    
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=0.00001,
        verbose=1
    )
    
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=12,
        verbose=1,
        restore_best_weights=True
    )
    
    callbacks = [checkpoint, reduce_lr, early_stopping]
    
    # Entraîner le modèle
    print("Démarrage de l'entraînement...")
    history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // BATCH_SIZE,
        callbacks=callbacks,
        class_weight=class_weights,
        verbose=1
    )
    
    # Évaluer le modèle sur les données de test
    print("Évaluation sur l'ensemble de test...")
    test_loss, test_acc = model.evaluate(test_generator)
    print(f'Test accuracy: {test_acc:.4f}')
    
    # Sauvegarder le modèle final
    model.save('emotion_recognition_balanced.h5')
    print("Modèle final sauvegardé: emotion_recognition_balanced.h5")
    
    # Visualiser les courbes d'apprentissage
    print("Création des visualisations...")
    plot_learning_curves(history)
    
    # Obtenir les prédictions sur l'ensemble de test et créer la matrice de confusion
    analyze_predictions(model, test_generator, class_names)
    
    # Montrer quelques exemples
    visualize_predictions(model, test_generator, class_names)
    
    print("Entraînement et évaluation terminés!")

# Fonctions auxiliaires pour la visualisation
def plot_learning_curves(history):
    """Visualise les courbes d'apprentissage"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    # Courbe de précision
    ax1.plot(history.history['accuracy'], label='Train')
    ax1.plot(history.history['val_accuracy'], label='Validation')
    ax1.set_title('Précision du modèle')
    ax1.set_ylabel('Précision')
    ax1.set_xlabel('Epoch')
    ax1.legend()
    
    # Courbe de perte
    ax2.plot(history.history['loss'], label='Train')
    ax2.plot(history.history['val_loss'], label='Validation')
    ax2.set_title('Perte du modèle')
    ax2.set_ylabel('Perte')
    ax2.set_xlabel('Epoch')
    ax2.legend()
    
    plt.tight_layout()
    plt.savefig('learning_curves_balanced.png')
    plt.show()

def analyze_predictions(model, data_generator, class_names):
    """Analyse les prédictions et crée une matrice de confusion"""
    data_generator.reset()
    y_pred = model.predict(data_generator)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true = data_generator.classes
    
    # Matrice de confusion
    cm = confusion_matrix(y_true, y_pred_classes)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.title('Matrice de confusion')
    plt.ylabel('Vraie étiquette')
    plt.xlabel('Étiquette prédite')
    plt.tight_layout()
    plt.savefig('confusion_matrix_balanced.png')
    plt.show()
    
    # Rapport de classification
    report = classification_report(y_true, y_pred_classes, target_names=class_names, output_dict=True)
    report_df = pd.DataFrame(report).transpose()
    print("Rapport de classification:")
    print(report_df)
    
    # Calcul de statistiques par classe
    print("\nPerformance par classe:")
    for i, class_name in enumerate(class_names):
        class_indices = np.where(y_true == i)[0]
        class_acc = np.mean(y_pred_classes[class_indices] == i)
        print(f"{class_name}: {class_acc:.4f} ({len(class_indices)} échantillons)")

def visualize_predictions(model, data_generator, class_names, num_samples=10):
    """Visualise quelques exemples de prédictions"""
    data_generator.reset()
    batch_x, batch_y = next(data_generator)
    predictions = model.predict(batch_x)
    
    fig, axes = plt.subplots(2, 5, figsize=(15, 6))
    axes = axes.flatten()
    
    for i in range(min(num_samples, len(batch_x))):
        img = batch_x[i].reshape(IMG_SIZE)
        true_label = np.argmax(batch_y[i])
        pred_label = np.argmax(predictions[i])
        pred_prob = np.max(predictions[i]) * 100
        
        axes[i].imshow(img, cmap='gray')
        color = 'green' if true_label == pred_label else 'red'
        title = f"Vraie: {class_names[true_label]}\nPrédite: {class_names[pred_label]}\n{pred_prob:.1f}%"
        axes[i].set_title(title, color=color)
        axes[i].axis('off')
    
    plt.tight_layout()
    plt.savefig('prediction_examples_balanced.png')
    plt.show()

if __name__ == "__main__":
    main()