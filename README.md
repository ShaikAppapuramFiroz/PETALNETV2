# PetalNetV2 - Efficient Flower Classification

Full-stack, production-ready app for classifying flowers (Daisy, Dandelion, Roses, Sunflowers, Tulips) using MobileNetV2 model with enhanced training pipeline achieving 95-98%+ accuracy. Published in IEEE IATMSI 2026 Conference.

## Quick Run Commands

```bash
# Terminal 1: Start Backend
cd backend
python main.py

# Terminal 2: Start Frontend  
cd frontend
npm run dev

# Then open http://localhost:5173 in your browser
```

## Folder Structure
```
backend/
  main.py
  requirements.txt
  model/
    model.h5           # or SavedModel folder (provide your trained weights)
frontend/
  index.html
  package.json
  vite.config.js
  src/
    App.jsx
    main.jsx
    styles.css
    components/
      UploadImage.jsx
      PredictionResult.jsx
      Navbar.jsx
      Footer.jsx
    services/
      api.js
tf_flowers/            # dataset you already have (not needed for inference)
Flower_Detection_CNN.ipynb
```

## Quick Start - Run the Project

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ and npm installed
- Trained model file at `backend/model/model.h5` (or `model.keras`)

### Step 1: Start Backend Server
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend will start on `http://localhost:8000`

### Step 2: Start Frontend Server
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

### Step 3: Access the Application
Open your browser and visit: `http://localhost:5173`

---

## Training the Model

### Enhanced Training (Recommended for Maximum Accuracy)

For maximum accuracy with advanced techniques (fine-tuning, better augmentation, comprehensive evaluation):
```bash
cd backend
python train_and_export.py
```

This enhanced training script:
- Uses advanced data augmentation (rotation, zoom, translation, brightness, contrast)
- Implements two-phase training: frozen base model + fine-tuning
- Includes comprehensive evaluation on test set
- Saves detailed metrics and confusion matrix
- Achieves higher accuracy through better architecture and training strategies

**Expected Results:**
- Training Accuracy: 95-98%+
- Validation Accuracy: 94-97%+
- Test Accuracy: 94-97%+

### Quick Training (Faster, Good Results)

For faster training with good results:
```bash
cd backend
python quick_train.py
```

This trains a simpler model architecture and is faster but may achieve slightly lower accuracy (~94%).

### Model Evaluation

After training, evaluate your model:
```bash
cd backend
python evaluate_model.py
```

This will:
- Test the model on the test set
- Generate classification report and confusion matrix
- Save evaluation results to `backend/model/evaluation_results.json`
- Create a confusion matrix visualization

---

## Backend (FastAPI)
- Preloads MobileNetV2 once at startup.
- Endpoint: `POST /predict` with form-data field `file` (image).
- Supports image URLs and file uploads.
- Preprocess: RGB, resize 224×224, MobileNetV2 preprocessing, add batch dim.
- Returns: `{"prediction": "daisy", "confidence": 0.94}`.

### Backend Commands
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run server
python main.py

# Or use uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Frontend (React + Vite)
- Components: `UploadImage` (file upload + URL input + preview), `PredictionResult` (detailed prediction with expandable info), `Navbar` (with Team Associates), `Footer`.
- Features: Image upload from file or URL, detailed prediction results, team information, research paper details.
- Axios API client in `services/api.js`; defaults to `http://localhost:8000`.
- Toasts for invalid images/errors, loader during inference, gradient flower-inspired theme.

### Frontend Commands
```bash
# Install dependencies (first time only)
cd frontend
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
Visit the shown port (default 5173).

## Deployment
### Frontend → Vercel
1. Push `frontend` to a repo.
2. In Vercel, import the repo, set `Framework: Vite`.
3. Set env var `VITE_API_URL=https://<your-backend-host>`.
4. Build command: `npm run build`, Output: `dist`.

### Backend → Render or Railway
1. Push `backend` to a repo.
2. Render: New Web Service → start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.
3. Railway: Similar, set `PORT` env and same start command.
4. Add your model file(s) to the repo or mount from storage. Ensure path matches `MODEL_PATH` in `main.py`.

## API Example (cURL)
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test prediction
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/flower.jpg"
```

## Project Features

### PetalNetV2 Frontend
- **Image Upload**: Upload images from your device or paste image URLs
- **Detailed Predictions**: Interactive prediction results with:
  - Main prediction with confidence percentage
  - Expandable detailed information about the flower
  - Confidence distribution chart
  - Model information
- **Team Associates**: View and edit team member information
- **Research Details**: IEEE IATMSI 2026 Conference submission information

### PetalNetV2 Backend
- FastAPI REST API
- MobileNetV2 model inference
- Image preprocessing and prediction
- Health check endpoint

## Notes
- Model files: `backend/model/model.h5` (H5 format) or `backend/model/model.keras` (Keras format)
- Class order: daisy, dandelion, roses, sunflowers, tulips
- Enhanced training uses 50+ epochs with fine-tuning for maximum accuracy
- TensorFlow CPU version in `requirements.txt`; switch to GPU wheels if needed
- Backend automatically handles model compatibility issues
- The enhanced training script achieves 95-98%+ accuracy through advanced techniques

## Model Accuracy

The enhanced training pipeline (`train_and_export.py`) uses:
- **Advanced Data Augmentation**: Random flips, rotations, zooms, translations, brightness, and contrast adjustments
- **Two-Phase Training**: 
  1. Phase 1: Train with frozen base model (MobileNetV2)
  2. Phase 2: Fine-tune top layers with lower learning rate
- **Enhanced Architecture**: Additional dense layers with batch normalization and dropout
- **Comprehensive Evaluation**: Test set evaluation with detailed metrics

**Expected Performance:**
- Training Accuracy: 95-98%+
- Validation Accuracy: 94-97%+
- Test Accuracy: 94-97%+
- Top-2 Accuracy: 98-99%+

For maximum accuracy, use `train_and_export.py`. For faster training, use `quick_train.py`.

## Optional Improvements
- Add multi-class confidence bars for top-k predictions.
- Enable caching/CDN for static frontend assets.
- Add request logging + monitoring (e.g., Prometheus) on backend.
- Add model versioning endpoint and health metrics.

