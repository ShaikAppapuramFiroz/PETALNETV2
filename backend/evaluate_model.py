"""
Comprehensive model evaluation script.
Tests the trained model on test set and provides detailed metrics.
"""

import os
import tensorflow as tf
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import json
import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.keras")
H5_PATH = os.path.join(BASE_DIR, "model", "model.h5")
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "tf_flowers", "flower_photos"))
CLASS_NAMES = ["daisy", "dandelion", "roses", "sunflowers", "tulips"]
IMG_SIZE = 224
BATCH_SIZE = 32


def load_model():
    """Load the trained model"""
    if os.path.exists(MODEL_PATH):
        print(f"Loading model from {MODEL_PATH}")
        return tf.keras.models.load_model(MODEL_PATH, compile=False)
    elif os.path.exists(H5_PATH):
        print(f"Loading model from {H5_PATH}")
        return tf.keras.models.load_model(H5_PATH, compile=False)
    else:
        raise FileNotFoundError(f"Model not found at {MODEL_PATH} or {H5_PATH}")


def evaluate():
    """Comprehensive evaluation"""
    print("\n" + "="*60)
    print("Model Evaluation")
    print("="*60)
    
    # Load model
    model = load_model()
    # Compile for evaluation
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=[
            "accuracy",
            tf.keras.metrics.SparseTopKCategoricalAccuracy(k=2),
        ],
    )
    
    # Load test dataset
    print("\nLoading test dataset...")
    test_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATA_DIR,
        labels="inferred",
        label_mode="int",
        class_names=CLASS_NAMES,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        validation_split=0.2,
        subset="validation",
        seed=123,
    )
    
    # Use 50% of validation as test
    test_size = int(len(list(test_ds)) * 0.5)
    test_ds = test_ds.skip(test_size).prefetch(tf.data.AUTOTUNE)
    
    print(f"Test samples: {len(list(test_ds)) * BATCH_SIZE}")
    
    # Evaluate
    print("\nEvaluating model...")
    test_results = model.evaluate(test_ds, verbose=1)
    
    if len(test_results) == 2:
        test_loss, test_acc = test_results
        test_top2_acc = None
    else:
        test_loss, test_acc, test_top2_acc = test_results
    
    print(f"\nTest Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")
    if test_top2_acc:
        print(f"Test Top-2 Accuracy: {test_top2_acc:.4f} ({test_top2_acc*100:.2f}%)")
    
    # Get predictions
    print("\nGenerating predictions...")
    y_true = []
    y_pred = []
    y_pred_proba = []
    
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(labels.numpy())
        y_pred.extend(np.argmax(preds, axis=1))
        y_pred_proba.extend(preds)
    
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_pred_proba = np.array(y_pred_proba)
    
    # Overall accuracy
    overall_acc = accuracy_score(y_true, y_pred)
    print(f"\nOverall Accuracy: {overall_acc:.4f} ({overall_acc*100:.2f}%)")
    
    # Classification report
    print("\n" + "="*60)
    print("Classification Report")
    print("="*60)
    print(classification_report(y_true, y_pred, target_names=CLASS_NAMES))
    
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
    per_class_acc = {}
    for i, class_name in enumerate(CLASS_NAMES):
        class_mask = y_true == i
        if np.sum(class_mask) > 0:
            class_acc = np.mean(y_pred[class_mask] == i)
            per_class_acc[class_name] = float(class_acc)
            print(f"{class_name}: {class_acc:.4f} ({class_acc*100:.2f}%)")
    
    # Save results
    results = {
        'test_loss': float(test_loss),
        'test_accuracy': float(test_acc),
        'overall_accuracy': float(overall_acc),
        'confusion_matrix': cm.tolist(),
        'per_class_accuracy': per_class_acc,
    }
    
    if test_top2_acc:
        results['test_top2_accuracy'] = float(test_top2_acc)
    
    results_path = os.path.join(BASE_DIR, "model", "evaluation_results.json")
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n✓ Results saved to {results_path}")
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    
    plot_path = os.path.join(BASE_DIR, "model", "confusion_matrix.png")
    plt.savefig(plot_path)
    print(f"✓ Confusion matrix plot saved to {plot_path}")
    
    print("\n" + "="*60)
    print("Evaluation Complete!")
    print("="*60)
    
    return results


if __name__ == "__main__":
    evaluate()

