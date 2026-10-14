# 🧘 FitAI Coach & SATHI AI — AI Yoga, Fitness & Nutrition Platform

FitAI Coach is an all-in-one, mobile-first AI fitness and wellness application that pairs **live browser camera yoga pose detection**, **personalized 7-day workout plans**, **Mifflin-St Jeor nutrition & calorie calculations**, **Indian meal composition logging**, **daily hydration tracking**, and **SATHI AI companion** (your 24/7 fitness and dietitian chatbot).

Frontend is optimized for **GitHub Pages** (static hosting) and backend is configured for 1-click **Render Web Service** deployment (Node.js Express).

---

## ⚡ Highlights & Key Features

- **🧘 Real-Time AI Yoga Tracking**:
  - Live in-browser pose estimation powered by **MediaPipe Pose Landmarker**.
  - Calculates real joint angles (shoulders, elbows, hips, knees) using vector trigonometry and cosine laws.
  - Camera access is requested **only** when the user explicitly taps "Start Practice".
  - Real-time voice and audio synthesis guidance with confidence-aware posture feedback.
  - **40 Authentic Yoga Poses** with Sanskrit names, categories, benefits, safety notes, and alignment rules (e.g. *Tadasana, Vrikshasana, Trikonasana, Virabhadrasana I & II, Bhujangasana, Malasana, Ustrasana, Surya Namaskar*).
- **💪 7-Day Personalized Workout Planner**:
  - Exactly **5 structured activities per day** with instructions, sets, reps, durations, difficulty ratings, target muscle groups, estimated calorie burn, and substitutions.
  - Includes daily warmup routines and cooldown stretches.
  - Session completion tracking and interactive workout summary modals.
  - **20+ Fitness Exercises** covering strength, hypertrophy, and aerobic conditioning (push-ups, squats, lunges, planks, glute bridges, mountain climbers, burpees, calf raises).
- **🔥 Scientific Calorie & Macro Engine**:
  - Clinically validated **Mifflin-St Jeor formula** for Basal Metabolic Rate (BMR) with gender adjustments.
  - Total Daily Energy Expenditure (TDEE) based on activity levels (sedentary, light, moderate, very active, extra active).
  - Target calorie calculations with clinical safety thresholds (minimum 1,200 kcal for females, 1,500 kcal for males).
  - Dynamic macronutrient targets (Protein, Carbohydrates, Fats) customized to fitness goals (fat loss, muscle gain, maintenance, mobility).
  - Body Mass Index (BMI) assessment with epidemiological context notes.
- **🥗 Indian Nutrition Database & Food Logger**:
  - Curated database of authentic Indian foods with accurate macro breakdowns: *Roti (Phulka), cooked white/brown rice, Moong dal, Toor dal, Rajma, Kabuli Chana, Low-fat & regular Paneer, Tofu, Poha, Idli-Sambar, Dosa, Soya chunks, Palak, Curd (Dahi), Boiled eggs, Grilled chicken/fish, Makhana*.
  - Portion multipliers (0.5x, 1x, 1.5x, 2x, 3x) and real-time total calculation.
  - Dietary filter support: Vegetarian, Vegan, Eggetarian, Non-Vegetarian.
  - Daily food logging with persistent local history + background backend sync.
- **💧 Daily Hydration Tracker**:
  - Dynamic water intake goal (35 ml per kg body weight baseline).
  - Animated hydration ring with percentage progress.
  - Quick-add buttons (+250 ml, +500 ml) with time-stamped history and undo functionality.
  - Browser notification reminder support.
- **✨ SATHI AI Companion (Dietitian & Fitness Chatbot)**:
  - 3 specialized modes: **Companion**, **Dietitian**, and **Fitness Coach**.
  - **Deterministic Math Engine**: Deficit/surplus math, BMR/TDEE targets, and Indian food macros are computed deterministically so numerical figures are never hallucinated.
  - **Google Gemini 2.5 Flash Proxy**: Secure server-side AI integration (`/api/ai/chat`) powered by `GEMINI_API_KEY`.
  - **Built-in Fallback Knowledge Engine**: If offline or running without an API key, SATHI answers instantly with accurate fitness, recipe, and posture guidance.
  - Speech-to-text voice input via Web Speech API.
- **🔒 Authentication & Privacy**:
  - Instant one-tap Guest Demo mode with rich starter profile for immediate evaluation.
  - Built-in Supabase Auth integration with PostgreSQL Row Level Security (RLS).
  - Zero hardcoded secrets in client-side code.
  - Camera feeds are processed strictly on-device; no video frames are recorded or transmitted to any server.

---

## 📂 Verified Repository Structure

```text
├── index.html               # Main web application entry point (GitHub Pages root)
├── style.css                # Base stylesheet bridge
├── script.js                # Unified application script bundle
├── server.js                # Standalone Express backend server (Render Web Service entry point)
├── render.yaml              # 1-Click Render Infrastructure-as-Code Blueprint
├── package.json             # Node.js dependencies, scripts & metadata
├── config.example.js        # Template for API_BASE_URL and Supabase credentials
├── .env.example             # Template for backend environment variables
├── .gitignore               # Clean git ignore rules (protects credentials)
├── manifest.json            # PWA Web App Manifest
├── service-worker.js        # Offline caching service worker
├── test_fitai_endpoints.js  # Automated 18-point API & health check test suite
├── build_unified_script.js  # Script to bundle modules into script.js
├── auth.js                  # Root bridge for auth module
├── nutrition.js             # Root bridge for nutrition module
├── workouts.js              # Root bridge for workouts module
├── yoga.js                  # Root bridge for yoga pose module
├── css/
│   ├── styles.css           # Design system tokens, glassmorphic dark theme, responsive grid
│   └── sathi.css            # SATHI AI animated companion orb & chat interface styles
├── js/
│   ├── app.js               # Application router, screen transitions & event orchestration
│   ├── auth.js              # Authentication management & profile synchronization
│   ├── calories.js          # Mifflin-St Jeor calorie, BMR, TDEE, macro & BMI calculator
│   ├── chatbot.js           # SATHI AI chatbot (backend integration + on-device AI)
│   ├── dashboard.js         # Dashboard metrics, streak tracking, daily quotes & charts
│   ├── nutrition.js         # Indian food database, meal planner & food logging
│   ├── pose.js              # Live MediaPipe Pose estimation & trigonometry feedback
│   ├── water.js             # Daily hydration tracker & reminder logic
│   └── workouts.js          # 40 yoga poses, 20+ exercises & 7-day workout plans
├── database/
│   └── schema.sql           # Production PostgreSQL schema with Row Level Security (RLS)
└── server/
    ├── server.js            # Modular server entry point delegating to root server.js
    ├── routes/
    │   ├── ai.js            # SATHI AI chat router
    │   └── profile.js       # Profile, food-log, water-log, workout session router
    └── middleware/
        └── auth.js          # JWT & Demo mode authorization middleware
```

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
# On Windows PowerShell:
Copy-Item .env.example .env
```
Set your `GEMINI_API_KEY` in `.env` if you wish to use live Google Gemini 2.5 Flash for SATHI AI. If omitted, SATHI will seamlessly use its built-in calculation & knowledge fallback engine.

### 3. Start the Backend Server
```bash
npm start
# or for development:
npm run dev
```

The server binds to `0.0.0.0` on port `3000` (or `process.env.PORT`):
- Web Application: `http://localhost:3000`
- SATHI AI Companion: `http://localhost:3000/#sathi`
- Health Check: `http://localhost:3000/api/health`

### 4. Run the Automated Test Suite
```bash
npm test
```
Runs `test_fitai_endpoints.js`, verifying all 18 static, API, authentication, and mathematical calculation endpoints.

---

## 🌐 Deploying Backend on Render (Node.js Web Service)

Deploy the backend to Render in 5 minutes:

### Step 1: Create a New Web Service on Render
1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository (`https://github.com/shovamdestroyer/fitman`).

### Step 2: Configure Service Settings
- **Name**: `fitman-backend` (or your preferred name)
- **Region**: Select the region closest to your users (e.g., Singapore, Frankfurt, Oregon)
- **Branch**: `main`
- **Root Directory**: `.` (leave blank or use repository root)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Step 3: Configure Environment Variables
Under the **Environment Variables** tab, add:
| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `CORS_ORIGIN` | `https://shovamdestroyer.github.io,http://localhost:3000` | Whitelisted origins |
| `GEMINI_API_KEY` | *(Your Google Gemini API Key)* | Optional: Enables live Gemini AI |
| `SUPABASE_URL` | *(Optional)* | Cloud Supabase project URL |
| `SUPABASE_ANON_KEY` | *(Optional)* | Cloud Supabase anonymous public key |

*Note: Render automatically supplies `PORT`, and Express is configured to read `process.env.PORT` and listen on `0.0.0.0`.*

### Step 4: Deploy and Verify
Click **Create Web Service**. Once deployed, your service URL will be something like:
`https://fitman-backend.onrender.com`

Verify by opening:
`https://fitman-backend.onrender.com/api/health`
You should see:
```json
{
  "status": "healthy",
  "app": "FitAI Coach",
  "sathiCompanion": "online",
  "port": 10000,
  "environment": "production",
  "geminiConfigured": true
}
```

---

## 📱 Publishing Frontend to GitHub Pages & Pairing with Backend

### Step 1: Configure Backend URL in Frontend
When the frontend is deployed on GitHub Pages (`https://shovamdestroyer.github.io/fitman`), API requests need to target your Render backend instead of relative GitHub Pages URLs.

1. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   # On Windows:
   Copy-Item config.example.js config.js
   ```
2. Edit `config.js` with your deployed Render URL:
   ```javascript
   window.API_BASE_URL = "https://fitman-backend.onrender.com";
   ```
3. Commit and push `config.js` to GitHub.

*(Note: If `config.js` is not provided or the backend is temporarily offline, the frontend's built-in offline engine automatically handles SATHI chat queries, nutrition calculations, and local data persistence so users experience zero disruption!)*

### Step 2: Enable GitHub Pages
1. On GitHub, navigate to your repository **Settings > Pages**.
2. Under **Build and deployment > Source**, select **Deploy from a branch**.
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Within 1–2 minutes, your website is live at:
   `https://shovamdestroyer.github.io/fitman/`

---

## 📡 API Endpoints Reference

All endpoints are hosted at `/api/*` and return standard JSON.

### 1. System Health
- **`GET /api/health`**
  - **Public**: Yes
  - **Response**: `{ status: "healthy", app: "FitAI Coach", sathiCompanion: "online", geminiConfigured: true, supabaseConfigured: false }`

### 2. SATHI AI Chatbot
- **`POST /api/ai/chat`**
  - **Auth**: Mandatory (`Authorization: Bearer <token>` or `x-guest-mode: true`)
  - **Body**:
    ```json
    {
      "message": "My maintenance is 2,400 calories. What is a 400-calorie deficit?",
      "history": [],
      "userProfile": { "weight": 70, "height": 175, "age": 26, "sex": "male" },
      "todayStats": { "caloriesConsumed": 1250, "waterConsumed": 1500 },
      "chatType": "companion"
    }
    ```
  - **Response**:
    ```json
    {
      "reply": "Your target would be approximately **2,000 kcal/day**...",
      "source": "deterministic_engine",
      "status": "success"
    }
    ```

### 3. User Profile & Synchronized Logging
- **`GET /api/profile`** — Fetch current athlete profile.
- **`POST /api/profile`** — Save/update athlete biometric parameters.
- **`GET /api/profile/today-stats`** — Fetch today's aggregated calories, macros, water intake, and completed workouts.
- **`POST /api/profile/food-log`** — Log a meal (`food_name`, `serving_size`, `calories`, `protein`, `carbs`, `fat`).
- **`POST /api/profile/water-log`** — Log water intake (`amount_ml`).
- **`POST /api/profile/workout-session`** — Log workout or yoga session (`session_type`, `duration_seconds`, `accuracy_score`).

---

## 🔐 Authentication: Demo Mode vs. Production

### 1. Instant Guest Demo Mode
- FitAI Coach includes an instant guest mode that enables full functional testing out of the box without requiring external cloud accounts or credit cards.
- Session tokens are safely managed in `localStorage` (`fitai_auth_token: "guest-demo-token"`).
- Requests include the `x-guest-mode: true` or `Authorization: Bearer guest-demo-token` header.
- **Important**: This demo mode is designed for user testing and demonstration; it is not a substitute for cryptographically signed identity verification in multi-tenant production systems.

### 2. Production Authentication (Supabase / PostgreSQL RLS)
- For multi-user production deployments, configure `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- The database schema located at `database/schema.sql` establishes tables with PostgreSQL **Row Level Security (RLS)** policies:
  - `profiles` — User biometric profiles restricted to `auth.uid() = id`.
  - `food_logs` — Nutritional logs restricted to `auth.uid() = user_id`.
  - `water_logs` — Hydration records restricted to `auth.uid() = user_id`.
  - `workout_sessions` — Workout logs restricted to `auth.uid() = user_id`.
- The backend verifies JWT signatures and payload claims before accessing user records.

---

## 🔒 Security & Secrets Protection

1. **No API Keys in Frontend Code**: Never hardcode API keys or secret tokens in HTML, CSS, or client JavaScript files.
2. **Server-Side API Keys**: `GEMINI_API_KEY` is read strictly on the backend from `process.env.GEMINI_API_KEY`.
3. **Git Protection**: `.env` and `.env.*.local` are explicitly included in `.gitignore` to prevent secret leakage to public GitHub repositories.
4. **On-Device Video Privacy**: Camera streams are analyzed entirely inside the user's browser via WebAssembly MediaPipe models. No video frames, camera snapshots, or audio recordings are uploaded or saved to any server.

---

## 🧪 Testing Summary

FitAI Coach includes comprehensive automated tests covering all components:
- **`npm test`**: Executes `test_fitai_endpoints.js`, testing 18 live endpoints including static assets, health checks, deterministic calorie math, Indian meal calculations, input validations, guest authentication, profile updates, meal logging, hydration tracking, workout sessions, and 401/404 security responses.
- **`node server/test.js`**: Validates the clinical Mifflin-St Jeor formula, 40 Yoga pose library entries, 20+ fitness exercises, and 7-day workout plan constraints.

---

## 📄 License

This project is licensed under the MIT License.
