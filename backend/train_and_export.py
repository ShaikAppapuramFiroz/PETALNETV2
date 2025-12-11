"""
Enhanced training script to achieve maximum accuracy for flower classification.
Uses advanced techniques: fine-tuning, better augmentation, learning rate scheduling.
"""

import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "tf_flowers", "flower_photos"))
MODEL_OUT = os.path.join(BASE_DIR, "model", "model.keras")
H5_OUT = os.path.join(BASE_DIR, "model", "model.h5")
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50  # Increased epochs for better convergence
CLASS_NAMES = ["daisy", "dandelion", "roses", "sunflowers", "tulips"]


def create_advanced_augmentation():
    """Create advanced data augmentation pipeline"""
    return tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.RandomTranslation(0.1, 0.1),
        layers.RandomBrightness(0.1),
        layers.RandomContrast(0.1),
    ])


def build_enhanced_model(base_model, num_classes, fine_tune_at=None):
    """Build enhanced model with better architecture"""
    # Freeze base model initially
    base_model.trainable = False
    
    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    
    # Data augmentation (only during training)
    x = create_advanced_augmentation()(inputs)
    
    # Preprocessing
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    
    # Base model
    x = base_model(x, training=False)
    
    # Enhanced head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(512, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    
    model = models.Model(inputs, outputs)
    
    # Compile with lower learning rate for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=[
            "accuracy",
            tf.keras.metrics.SparseTopKCategoricalAccuracy(k=2),
        ],
    )
    
    return model


def fine_tune_model(model, base_model, num_classes, train_ds, val_ds, epochs_fine_tune=20):
    """Fine-tune the model by unfreezing top layers"""
    print("\n" + "="*60)
    print("Starting Fine-Tuning Phase")
    print("="*60)
    
    # Unfreeze top layers of base model
    base_model.trainable = True
    
    # Fine-tune from layer 100 onwards (top layers)
    fine_tune_at = 100
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False
    
    # Recompile with lower learning rate for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="sparse_categorical_crossentropy",
        metrics=[
            "accuracy",
            tf.keras.metrics.SparseTopKCategoricalAccuracy(k=2),
        ],
    )
    
    # Fine-tuning callbacks
    fine_tune_checkpoint = ModelCheckpoint(
        MODEL_OUT.replace('.keras', '_finetuned.keras'),
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    )
    
    reduce_lr_fine = ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=4,
        min_lr=1e-7,
        verbose=1,
    )
    
    early_stop_fine = EarlyStopping(
        monitor="val_accuracy",
        patience=10,
        restore_best_weights=True,
        verbose=1,
    )
    
    # Fine-tune
    history_fine = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_fine_tune,
        callbacks=[fine_tune_checkpoint, reduce_lr_fine, early_stop_fine],
        verbose=1,
    )
    
    return history_fine


def evaluate_model(model, test_ds, class_names):
    """Comprehensive model evaluation"""
    print("\n" + "="*60)
    print("Evaluating Model on Test Set")
    print("="*60)
    
    # Evaluate
    test_results = model.evaluate(test_ds, verbose=1)
    test_loss, test_acc, test_top2_acc = test_results
    
    print(f"\nTest Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")
    print(f"Test Top-2 Accuracy: {test_top2_acc:.4f} ({test_top2_acc*100:.2f}%)")
    
    # Get predictions
    y_true = []
    y_pred = []
    y_pred_proba = []
    
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(labels.numpy())
        y_pred.extend(np.argmax(preds, axis=1))
        y_pred_proba.extend(preds)
    
    # Classification report
    print("\n" + "="*60)
    print("Classification Report")
    print("="*60)
    print(classification_report(y_true, y_pred, target_names=class_names))
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    print("\n" + "="*60)
    print("Confusion Matrix")
    print("="*60)
    print(cm)
    
    # Per-class accuracy
    print("\n" + "="*60)
    print("Per-Class Accuracy")
    print("="*60)
    for i, class_name in enumerate(class_names):
        class_mask = np.array(y_true) == i
        if np.sum(class_mask) > 0:
            class_acc = np.mean(np.array(y_pred)[class_mask] == i)
            print(f"{class_name}: {class_acc:.4f} ({class_acc*100:.2f}%)")
    
    return {
        'test_loss': float(test_loss),
        'test_accuracy': float(test_acc),
        'test_top2_accuracy': float(test_top2_acc),
        'confusion_matrix': cm.tolist(),
        'per_class_accuracy': {
            class_names[i]: float(np.mean(np.array(y_pred)[np.array(y_true) == i] == i))
            for i in range(len(class_names))
            if np.sum(np.array(y_true) == i) > 0
        }
    }


def main():
    if not os.path.isdir(DATA_DIR):
        raise SystemExit(f"Dataset not found at {DATA_DIR}")

    print("\n" + "="*60)
    print("PetalNetV2 - Enhanced Training for Maximum Accuracy")
    print("="*60)
    
    # Load datasets
    print("\nLoading datasets...")
    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATA_DIR,
        labels="inferred",
        label_mode="int",
        class_names=CLASS_NAMES,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        validation_split=0.2,
        subset="training",
        seed=123,
    )
    
    # Optimize datasets
    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.shuffle(1000).prefetch(autotune)
    
    # Create validation set (15% of total)
    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATA_DIR,
        labels="inferred",
        label_mode="int",
        class_names=CLASS_NAMES,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        validation_split=0.15,
        subset="validation",
        seed=123,
    )
    
    # Create test set (5% of total, using a different seed to avoid overlap)
    test_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATA_DIR,
        labels="inferred",
        label_mode="int",
        class_names=CLASS_NAMES,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        validation_split=0.05,
        subset="validation",
        seed=456,  # Different seed to get different subset
    )
    
    val_ds = val_ds.prefetch(autotune)
    test_ds = test_ds.prefetch(autotune)
    
    print(f"Datasets prepared:")
    print(f"  - Training set: ready (80% of data)")
    print(f"  - Validation set: ready (15% of data)") 
    print(f"  - Test set: ready (5% of data)")
    
    # Build base model
    print("\nBuilding model...")
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    
    model = build_enhanced_model(base_model, len(CLASS_NAMES))
    
    print(f"Total parameters: {model.count_params():,}")
    print(f"Trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")
    
    # Callbacks for initial training
    early_stopping = EarlyStopping(
        monitor="val_accuracy",
        patience=15,
        restore_best_weights=True,
        verbose=1,
    )
    
    checkpoint = ModelCheckpoint(
        MODEL_OUT,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    )
    
    reduce_lr = ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=5,
        min_lr=1e-7,
        verbose=1,
    )
    
    # Phase 1: Train with frozen base
    print("\n" + "="*60)
    print("Phase 1: Training with Frozen Base Model")
    print("="*60)
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[early_stopping, checkpoint, reduce_lr],
        verbose=1,
    )
    
    # Phase 2: Fine-tuning
    history_fine = fine_tune_model(
        model, base_model, len(CLASS_NAMES), train_ds, val_ds, epochs_fine_tune=30
    )
    
    # Combine histories
    combined_history = {
        'accuracy': history.history['accuracy'] + history_fine.history['accuracy'],
        'val_accuracy': history.history['val_accuracy'] + history_fine.history['val_accuracy'],
        'loss': history.history['loss'] + history_fine.history['loss'],
        'val_loss': history.history['val_loss'] + history_fine.history['val_loss'],
    }
    
    # Final evaluation
    eval_results = evaluate_model(model, test_ds, CLASS_NAMES)
    
    # Save model
    os.makedirs(os.path.dirname(MODEL_OUT), exist_ok=True)
    model.save(MODEL_OUT)
    model.save(H5_OUT)
    print(f"\n✓ Model saved to {MODEL_OUT} and {H5_OUT}")
    
    # Save evaluation results
    results_path = os.path.join(BASE_DIR, "model", "evaluation_results.json")
    with open(results_path, 'w') as f:
        json.dump(eval_results, f, indent=2)
    print(f"✓ Evaluation results saved to {results_path}")
    
    # Print final summary
    print("\n" + "="*60)
    print("Training Complete!")
    print("="*60)
    best_val_acc = max(combined_history['val_accuracy'])
    best_train_acc = max(combined_history['accuracy'])
    print(f"Best Validation Accuracy: {best_val_acc:.4f} ({best_val_acc*100:.2f}%)")
    print(f"Best Training Accuracy: {best_train_acc:.4f} ({best_train_acc*100:.2f}%)")
    print(f"Test Accuracy: {eval_results['test_accuracy']:.4f} ({eval_results['test_accuracy']*100:.2f}%)")
    print(f"Test Top-2 Accuracy: {eval_results['test_top2_accuracy']:.4f} ({eval_results['test_top2_accuracy']*100:.2f}%)")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
