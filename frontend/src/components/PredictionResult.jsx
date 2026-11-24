import { useState } from "react";
import PropTypes from "prop-types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CLASS_NAMES = ["daisy", "dandelion", "roses", "sunflowers", "tulips"];
const CLASS_INFO = {
  daisy: {
    description: "Daisies are cheerful flowers with white petals and a yellow center.",
    season: "Spring to Fall",
    colors: "White, Yellow, Pink",
  },
  dandelion: {
    description: "Dandelions are bright yellow flowers with toothed leaves.",
    season: "Spring to Summer",
    colors: "Yellow",
  },
  roses: {
    description: "Roses are classic flowers known for their fragrance and beauty.",
    season: "Year-round",
    colors: "Red, Pink, White, Yellow, Orange",
  },
  sunflowers: {
    description: "Sunflowers are tall flowers with large yellow petals and dark centers.",
    season: "Summer to Fall",
    colors: "Yellow, Orange",
  },
  tulips: {
    description: "Tulips are elegant flowers with cup-shaped petals in various colors.",
    season: "Spring",
    colors: "Red, Yellow, Pink, Purple, White",
  },
};

function PredictionResult({ result }) {
  const [showDetails, setShowDetails] = useState(true);

  if (!result) {
    return (
      <section className="result-card">
        <h2>Prediction Results</h2>
        <p className="muted">Results will appear here after you classify an image.</p>
      </section>
    );
  }

  const confidencePercent = Math.round(result.confidence * 100);
  const flowerInfo = CLASS_INFO[result.prediction] || {};

  // Create chart data with all classes for comparison
  // Use all_probabilities if available, otherwise fallback to single prediction
  const allProbs = result.all_probabilities || {};
  const chartData = CLASS_NAMES.map((name) => {
    const prob = allProbs[name] || (name === result.prediction ? result.confidence : 0);
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(prob * 100),
      isPredicted: name === result.prediction,
    };
  });

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "#10b981"; // Green
    if (confidence >= 60) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  return (
    <section className="result-card detailed">
      <div className="result-header">
        <h2>Prediction Results</h2>
        <button
          className="toggle-details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "▲ Hide Details" : "▼ Show Details"}
        </button>
      </div>

      <div className="main-prediction">
        <div className="prediction-badge-large">
          <div className="flower-icon">🌸</div>
          <div>
            <h3 className="flower-name">{result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)}</h3>
            <div className="confidence-meter">
              <div
                className="confidence-bar"
                style={{
                  width: `${confidencePercent}%`,
                  backgroundColor: getConfidenceColor(confidencePercent),
                }}
              />
              <span className="confidence-text">
                {confidencePercent}% Confidence
              </span>
            </div>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Prediction</span>
            <span className="stat-value">{result.prediction.toUpperCase()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Confidence</span>
            <span className="stat-value">{confidencePercent}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Model Accuracy</span>
            <span className="stat-value">94%+</span>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="detailed-info">
          <div className="info-section">
            <h4>About {result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)}</h4>
            <p>{flowerInfo.description || "No additional information available."}</p>
            <div className="info-grid">
              <div className="info-item">
                <strong>Season:</strong> {flowerInfo.season || "N/A"}
              </div>
              <div className="info-item">
                <strong>Colors:</strong> {flowerInfo.colors || "N/A"}
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h4>Confidence Distribution</h4>
            <div className="chart-wrapper-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#666" }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#666" }} />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isPredicted ? getConfidenceColor(entry.value) : "#e5e7eb"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="model-info">
            <h4>Model Information</h4>
            <div className="model-details">
              <span>Architecture: MobileNetV2</span>
              <span>Dataset: TF-Flowers</span>
              <span>Classes: 5 (Daisy, Dandelion, Roses, Sunflowers, Tulips)</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

PredictionResult.propTypes = {
  result: PropTypes.shape({
    prediction: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
  }),
};

export default PredictionResult;

