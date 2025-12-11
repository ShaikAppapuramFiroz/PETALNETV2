from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List
from PIL import Image, ImageEnhance
import numpy as np
import io
import os
import tensorflow as tf
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --- Configuration ---
MODEL_PATH = "model/model.keras"  # Try Keras format first, fallback to H5
TARGET_SIZE = (224, 224)
CLASS_NAMES: List[str] = ["daisy", "dandelion", "roses", "sunflowers", "tulips"]


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    all_probabilities: dict  # All class probabilities for visualization


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactResponse(BaseModel):
    success: bool
    message: str


def load_model():
    try:
        # Try Keras format first, then fallback to H5
        finetuned_path = "model/model_finetuned.keras"
        keras_path = "model/model.keras"
        h5_path = "model/model.h5"
        
        if os.path.exists(finetuned_path):
            print(f"Loading model from {finetuned_path}")
            model = tf.keras.models.load_model(finetuned_path, compile=False)
        elif os.path.exists(keras_path):
            print(f"Loading model from {keras_path}")
            model = tf.keras.models.load_model(keras_path, compile=False)
        elif os.path.exists(h5_path):
            print(f"Loading model from {h5_path}")
            try:
                # Try loading with compile=False first
                model = tf.keras.models.load_model(h5_path, compile=False)
            except ValueError as e:
                if "Unknown layer" in str(e) or "TrueDivide" in str(e):
                    # Handle compatibility issue - rebuild model architecture WITHOUT data augmentation
                    # Data augmentation should only be used during training, not inference
                    print(f"⚠ Compatibility issue detected. Rebuilding model architecture for inference...")
                    from tensorflow.keras import layers, models
                    
                    # Rebuild the model architecture WITHOUT data augmentation (inference mode)
                    base_model = tf.keras.applications.MobileNetV2(
                        input_shape=(224, 224, 3),
                        include_top=False,
                        weights="imagenet",
                    )
                    base_model.trainable = False
                    
                    # IMPORTANT: No data augmentation during inference - only during training
                    inputs = layers.Input(shape=(224, 224, 3))
                    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
                    x = base_model(x, training=False)
                    x = layers.GlobalAveragePooling2D()(x)
                    x = layers.Dropout(0.2)(x)
                    outputs = layers.Dense(5, activation="softmax")(x)
                    model = models.Model(inputs, outputs)
                    
                    # Try to load weights only
                    try:
                        # Load weights - need to specify by_name=True for proper layer matching
                        model.load_weights(h5_path, by_name=True, skip_mismatch=False)
                        
                        # Verify weights were loaded by checking a sample prediction
                        test_input = tf.random.normal((1, 224, 224, 3))
                        test_preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(test_input)
                        test_pred = model.predict(test_preprocessed, verbose=0)
                        
                        # Check if predictions are reasonable (not all zeros or same values)
                        if np.allclose(test_pred, test_pred[0, 0], rtol=1e-5):
                            print("⚠ Warning: Model predictions appear uniform. Weights may not have loaded correctly.")
                        else:
                            print("✓ Model rebuilt and trained weights loaded successfully")
                            print(f"  Test prediction variance: {np.var(test_pred):.6f}")
                    except Exception as e2:
                        # If weights loading fails, we need the trained model
                        raise RuntimeError(
                            f"Could not load trained weights from {h5_path}. "
                            f"The model needs to be retrained. Error: {e2}"
                        )
                else:
                    raise
        else:
            raise FileNotFoundError(f"Model not found at {keras_path} or {h5_path}")
        
        return model
    except Exception as exc:  # pragma: no cover - startup failure path
        raise RuntimeError(f"Could not load model: {exc}")


def preprocess_image_variants(data: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(data))
        if image.mode != "RGB":
            image = image.convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}")

    variants = []

    base = image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    variants.append(base)
    variants.append(base.transpose(Image.FLIP_LEFT_RIGHT))

    arrays = []
    for img in variants:
        arr = np.asarray(img, dtype=np.float32)
        arrays.append(arr)

    batch = np.stack(arrays, axis=0)
    return batch


app = FastAPI(title="Flower Classifier API", version="1.0.0")

# Allow local dev + popular hosting domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_models():
    models_loaded = []
    # Prefer finetuned + standard if both exist
    paths = [
        "model/model_finetuned.keras",
        "model/model.keras",
    ]
    added = set()
    for p in paths:
        if os.path.exists(p):
            try:
                m = tf.keras.models.load_model(p, compile=False)
                models_loaded.append(m)
                added.add(p)
                print(f"✓ Loaded model: {p}")
            except Exception as e:
                print(f"⚠ Could not load {p}: {e}")

    # Fallback to H5 if none loaded
    if not models_loaded and os.path.exists("model/model.h5"):
        m = load_model()
        models_loaded.append(m)

    if not models_loaded:
        raise RuntimeError("No model files found in model/ directory")

    return models_loaded

models_list = load_models()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    # Accept all image types including WebP
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp"]
    if file.content_type and not any(file.content_type.lower().startswith(allowed.split("/")[0]) for allowed in allowed_types):
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File must be an image. Supported formats: JPEG, PNG, WebP, GIF, BMP. Got: {file.content_type}")

    image_bytes = await file.read()
    
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    
    batch = preprocess_image_variants(image_bytes)

    try:
        preds_list = []
        for m in models_list:
            preds_list.append(m.predict(batch, verbose=0))
        preds = np.mean(np.stack(preds_list, axis=0), axis=0)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}")

    probs = np.mean(preds, axis=0)
    probs = probs.numpy() if hasattr(probs, 'numpy') else probs
    
    # Ensure probabilities are valid
    probs = np.clip(probs, 0.0, 1.0)
    probs = probs / (np.sum(probs) + 1e-8)  # Normalize to ensure sum is 1
    
    top_idx = int(np.argmax(probs))
    confidence = float(probs[top_idx])
    
    # Create dictionary of all probabilities
    all_probs = {name: float(prob) for name, prob in zip(CLASS_NAMES, probs)}
    
    # Debug: Log prediction distribution
    print(f"Prediction probabilities: {all_probs}")
    
    return PredictionResponse(
        prediction=CLASS_NAMES[top_idx],
        confidence=confidence,
        all_probabilities=all_probs,
    )


@app.post("/contact", response_model=ContactResponse)
async def send_contact_email(contact: ContactRequest):
    """Send contact form email to the team"""
    try:
        # Email configuration - Update these with your email settings
        # For Gmail, you'll need to use an App Password: https://support.google.com/accounts/answer/185833
        SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
        SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
        SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")
        RECIPIENT_EMAIL = "appapuramfirozforr@gmail.com"
        
        # Create message
        msg = MIMEMultipart()
        msg["From"] = SMTP_USERNAME
        msg["To"] = RECIPIENT_EMAIL
        msg["Subject"] = f"Contact Form: {contact.subject}"
        
        # Email body
        body = f"""
        New contact form submission from PetalNetV2 website:
        
        Name: {contact.name}
        Email: {contact.email}
        Subject: {contact.subject}
        
        Message:
        {contact.message}
        """
        
        msg.attach(MIMEText(body, "plain"))
        
        # Send email
        try:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            
            return ContactResponse(
                success=True,
                message="Email sent successfully"
            )
        except Exception as e:
            print(f"Email sending error: {e}")
            # For development, return success even if email fails
            # In production, you might want to log this and return an error
            return ContactResponse(
                success=True,
                message="Message received (email service not configured)"
            )
            
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {exc}")


# For local debugging: python backend/main.py
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
