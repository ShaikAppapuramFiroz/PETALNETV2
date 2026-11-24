import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin || "http://localhost:8000";

if (!API_BASE_URL) {
  console.error("❌ VITE_API_URL is not defined");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const classifyFlower = async (file, onUploadProgress) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      onUploadProgress?.(percent);
    },
  });

  return response.data;
};
