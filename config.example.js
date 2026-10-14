// config.example.js
// Frontend Configuration for FitAI Coach
// When deploying the frontend on GitHub Pages (static hosting),
// copy this file to "config.js" and set your deployed Render backend URL.

// 1. Backend Web Service URL (e.g., Render, Railway):
// Set this to your live Render backend so GitHub Pages can call /api/ai/chat, /api/profile, /api/health
window.API_BASE_URL = "https://your-backend.onrender.com";

// 2. Optional: Supabase Authentication & Cloud Database:
// window.SUPABASE_URL = "https://your-project-id.supabase.co";
// window.SUPABASE_ANON_KEY = "your-anon-public-key";
