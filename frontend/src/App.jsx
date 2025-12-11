import { useState } from "react";
import Navbar from "./components/Navbar";
import UploadImage from "./components/UploadImage";
import PredictionResult from "./components/PredictionResult";
import Footer from "./components/Footer";
import { classifyFlower } from "./services/api";
import { ToastContainer, toast } from "react-toastify";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFileChange = (file) => {
    if (!file) {
      setSelectedFile(null);
      setImageUrl("");
      setPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    setSelectedFile(file);
    setImageUrl("");
    setPreview(URL.createObjectURL(file));
  };

  const handleUrlChange = async (url) => {
    if (!url) {
      setImageUrl("");
      setPreview("");
      setSelectedFile(null);
      return;
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL.");
      return;
    }

    setImageUrl(url);
    setSelectedFile(null);
    setPreview(url);
    
    // Test if image loads
    const img = new Image();
    img.onload = () => {
      toast.success("Image loaded successfully!");
    };
    img.onerror = () => {
      toast.error("Failed to load image from URL. Please check the link.");
      setPreview("");
    };
    img.src = url;
  };

  const handlePredict = async () => {
    if (!selectedFile && !imageUrl) {
      toast.warn("Upload an image or provide an image URL first.");
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    setUploadProgress(0);
    
    try {
      let data;
      if (selectedFile) {
        // Upload file
        data = await classifyFlower(selectedFile, setUploadProgress);
      } else if (imageUrl) {
        // Convert URL to blob and upload
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", { type: blob.type });
        data = await classifyFlower(file, setUploadProgress);
      }
      setResult(data);
    } catch (err) {
      const message =
        err?.response?.data?.detail || "Prediction failed. Try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">Efficient Flower Classification</p>
            <h1>
              Identify flowers in seconds with{" "}
              <span className="highlight">PetalNetV2</span> - An Advanced MobileNetV2 model.
            </h1>
            <p className="subtext">
              Upload an image or paste an image URL, hit classify, and see detailed prediction results with confidence scores.
            </p>
          </div>
          <div className="glass-card">
            <UploadImage
              onFileChange={handleFileChange}
              onUrlChange={handleUrlChange}
              preview={preview}
              uploadProgress={uploadProgress}
              isLoading={isLoading}
            />
            <button
              className="primary-btn"
              onClick={handlePredict}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loader" aria-label="Loading" />
              ) : (
                "Classify Flower"
              )}
            </button>
          </div>
        </section>

        <PredictionResult result={result} />
      </main>
      <Footer />
      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
}

export default App;

