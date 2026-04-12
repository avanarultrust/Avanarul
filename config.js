/** Netlify: set VITE_API_URL in Site settings → Environment variables (no trailing slash). */
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
