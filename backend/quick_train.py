"""
Quick training script - simplified version for faster iteration.
Use train_and_export.py for maximum accuracy.
"""

import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "tf_flowers", "flower_photos"))
MODEL_OUT = os.path.join(BASE_DIR, "model", "model.keras")
H5_OUT = os.path.join(BASE_DIR, "model", "model.h5")
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 30
CLASS_NAMES = ["daisy", "dandelion", "roses", "sunflowers", "tulips"]


def main():
    if not os.path.isdir(DATA_DIR):
        raise SystemExit(f"Dataset not found at {DATA_DIR}")

    print("\n" + "="*60)
    print("Quick Training - PetalNetV2")
    print("="*60)

    # Load datasets
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
    
    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
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

    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.shuffle(1000).prefetch(autotune)
    val_ds = val_ds.prefetch(autotune)

    # Data augmentation
    data_aug = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ])

    # Build model
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    x = data_aug(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(len(CLASS_NAMES), activation="softmax")(x)
    model = models.Model(inputs, outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    # Callbacks
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

    # Train
    print(f"\nTraining for {EPOCHS} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[early_stopping, checkpoint, reduce_lr],
        verbose=1,
    )

    # Save
    os.makedirs(os.path.dirname(MODEL_OUT), exist_ok=True)
    model.save(MODEL_OUT)
    model.save(H5_OUT)
    
    # Results
    best_val_acc = max(history.history["val_accuracy"])
    best_train_acc = max(history.history["accuracy"])
    
    print(f"\n{'='*60}")
    print(f"Training Complete!")
    print(f"Best Validation Accuracy: {best_val_acc:.4f} ({best_val_acc*100:.2f}%)")
    print(f"Best Training Accuracy: {best_train_acc:.4f} ({best_train_acc*100:.2f}%)")
    print(f"Model saved to {MODEL_OUT} and {H5_OUT}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()

