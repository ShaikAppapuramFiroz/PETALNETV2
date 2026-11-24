import { useState } from "react";
import PropTypes from "prop-types";

function UploadImage({ onFileChange, onUrlChange, preview, uploadProgress, isLoading, hint }) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file || null);
      setShowUrlInput(false);
      setImageUrl("");
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onUrlChange(imageUrl.trim());
      setShowUrlInput(false);
    }
  };

  const handleUrlChangeInput = (e) => {
    setImageUrl(e.target.value);
  };

  return (
    <div className="upload-card">
      {hint && (
        <div className="hint-banner" role="note">
          <strong>Note:</strong> Upload flower images only in these classes — Daisy, Dandelion, Roses, Sunflowers, Tulips.
        </div>
      )}
      <div className="upload-options">
        <label className="upload-label">
        <input
          type="file"
          accept="image/*,.webp,image/webp"
          onChange={handleFileChange}
          disabled={isLoading}
        />
          <span>📁 Upload Image</span>
        </label>
        <button
          className="url-toggle-btn"
          onClick={() => {
            setShowUrlInput(!showUrlInput);
            if (!showUrlInput) setImageUrl("");
          }}
          disabled={isLoading}
        >
          🔗 Use URL
        </button>
      </div>

      {showUrlInput && (
        <div className="url-input-container">
          <input
            type="url"
            value={imageUrl}
            onChange={handleUrlChangeInput}
            placeholder="Enter image URL..."
            className="url-input"
            disabled={isLoading}
            onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <button
            className="url-submit-btn"
            onClick={handleUrlSubmit}
            disabled={isLoading || !imageUrl.trim()}
          >
            Load
          </button>
        </div>
      )}

      {preview ? (
        <img src={preview} alt="preview" className="preview" />
      ) : (
        <div className="preview placeholder">Image preview will appear here</div>
      )}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  );
}

UploadImage.propTypes = {
  onFileChange: PropTypes.func.isRequired,
  onUrlChange: PropTypes.func,
  preview: PropTypes.string,
  uploadProgress: PropTypes.number,
  isLoading: PropTypes.bool,
  hint: PropTypes.string,
};

UploadImage.defaultProps = {
  onUrlChange: () => {},
  preview: "",
  uploadProgress: 0,
  isLoading: false,
  hint: "",
};

export default UploadImage;

