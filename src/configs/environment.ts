
// Environment variables
export const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5000";
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Log if Gemini API key is missing (for debugging)
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set in environment variables. Gemini API calls will fail.");
}
