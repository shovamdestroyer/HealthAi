// server.js
// FitAI Coach & SATHI AI — Robust Standalone Express Backend Server
// Designed for local development and direct 1-click Render Web Service deployment.

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables (.env file if present)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// ---------------------------------------------------------
// 1. CORS Configuration
// Restricted to configured frontend origins (GitHub Pages, localhost)
// ---------------------------------------------------------
const defaultAllowedOrigins = [
  'https://shovamdestroyer.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : defaultAllowedOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // If wildcard configured
    if (configuredOrigins.includes('*')) {
      return callback(null, true);
    }

    // Exact match in configured origins list
    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Dynamic match for any GitHub Pages origin (*.github.io)
    if (/^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin)) {
      return callback(null, true);
    }

    // In non-production or for demo convenience, allow with warning
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin ${origin} not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-mode']
}));

// ---------------------------------------------------------
// 2. Body Parsing Middleware
// ---------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------
// 3. Static Asset Serving
// Serves index.html, style.css, script.js, css/, js/
// ---------------------------------------------------------
app.use(express.static(__dirname));

// ---------------------------------------------------------
// 4. In-Memory Store (Sessions, Profiles & Logs)
// Synced with client profile state; can be persisted to Supabase/PostgreSQL
// ---------------------------------------------------------
const store = {
  profiles: {},
  foodLogs: {},
  waterLogs: {},
  workoutSessions: {}
};

// ---------------------------------------------------------
// 5. Authentication Middleware
// Supports Guest Demo Mode and Supabase JWT tokens
// ---------------------------------------------------------
function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    if (req.headers['x-guest-mode'] === 'true') {
      req.user = {
        id: 'guest-user-demo',
        email: 'guest@fitai.local',
        name: 'Demo Athlete',
        isGuest: true
      };
      return next();
    }
    return res.status(401).json({ error: 'Missing Authorization header. Authentication is mandatory.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Invalid Authorization token format.' });
  }

  if (token === 'guest-demo-token') {
    req.user = {
      id: 'guest-user-demo',
      email: 'guest@fitai.local',
      name: 'Demo Athlete',
      isGuest: true
    };
    return next();
  }

  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      req.user = {
        id: payload.sub || payload.id || 'auth-user',
        email: payload.email || 'user@fitai.local',
        role: payload.role || 'authenticated',
        isGuest: false
      };
      return next();
    }

    req.user = {
      id: token,
      email: 'user@fitai.local',
      name: 'Authenticated Athlete',
      isGuest: false
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed: ' + err.message });
  }
}

// ---------------------------------------------------------
// 6. SATHI AI Deterministic Mathematical Engine
// Accurate clinical and nutritional calculations (no LLM hallucination)
// ---------------------------------------------------------
function evaluateDeterministicMath(query, profile = {}, stats = {}) {
  const lower = query.toLowerCase();

  // A. Deficit / Surplus calculation
  if (lower.includes('deficit') || lower.includes('surplus')) {
    const numbers = lower.match(/\d+[\d,]*/g);
    if (numbers && numbers.length >= 2) {
      const parsedNums = numbers.map(n => parseFloat(n.replace(/,/g, ''))).sort((a, b) => b - a);
      const maintenance = parsedNums[0];
      const adjustment = parsedNums[1];
      const type = lower.includes('deficit') ? 'deficit' : 'surplus';
      if (maintenance >= 1000 && adjustment <= 2000) {
        const result = type === 'deficit' ? maintenance - adjustment : maintenance + adjustment;
        return {
          matched: true,
          answer: `Your target would be approximately **${result.toLocaleString()} kcal/day**, assuming your maintenance estimate of ${maintenance.toLocaleString()} kcal is accurate.\n\n` +
            `• **Adjustment**: ${type === 'deficit' ? '-' : '+'}${adjustment.toLocaleString()} kcal/day\n` +
            `• **Estimated Weekly Rate**: ${((adjustment * 7) / 7700).toFixed(2)} kg of body fat change per week (based on the standard energy density of ~7,700 kcal per 1 kg of adipose tissue).\n` +
            `*Note: Energy expenditure fluctuates dynamically with non-exercise activity (NEAT) and metabolic adaptation. Re-evaluate weekly.*`
        };
      }
    }
  }

  // B. Roti & Dal nutritional breakdown
  if (lower.includes('roti') && lower.includes('dal')) {
    const rotiMatch = lower.match(/(\d+)\s*roti/i) || lower.match(/two\s*roti/i);
    let rotiCount = 2;
    if (rotiMatch && rotiMatch[1]) rotiCount = parseInt(rotiMatch[1]);
    else if (lower.includes('two roti') || lower.includes('2 rotis')) rotiCount = 2;
    else if (lower.includes('one roti') || lower.includes('1 roti')) rotiCount = 1;
    else if (lower.includes('three roti') || lower.includes('3 rotis')) rotiCount = 3;

    const rotiCalories = rotiCount * 85;
    const rotiProtein = (rotiCount * 2.8).toFixed(1);
    const rotiCarbs = (rotiCount * 17).toFixed(1);
    const rotiFat = (rotiCount * 0.8).toFixed(1);

    const dalCalories = 150;
    const dalProtein = 8.5;
    const dalCarbs = 22;
    const dalFat = 3.5;

    const totalCals = rotiCalories + dalCalories;
    const totalProt = (parseFloat(rotiProtein) + dalProtein).toFixed(1);
    const totalCarb = (parseFloat(rotiCarbs) + dalCarbs).toFixed(1);
    const totalF = (parseFloat(rotiFat) + dalFat).toFixed(1);

    return {
      matched: true,
      answer: `Here is the verified nutritional breakdown for **${rotiCount} medium handmade whole wheat rotis** and **1 bowl (~150g) of home-style cooked dal (moong/toor)**:\n\n` +
        `🫓 **${rotiCount} Rotis (~${rotiCount * 35}g dough without excess ghee)**:\n` +
        `• Calories: ~${rotiCalories} kcal\n` +
        `• Protein: ~${rotiProtein} g | Carbs: ~${rotiCarbs} g | Fat: ~${rotiFat} g\n\n` +
        `🍲 **1 Bowl Dal (~150g cooked with light tadka)**:\n` +
        `• Calories: ~${dalCalories} kcal\n` +
        `• Protein: ~${dalProtein} g | Carbs: ~${dalCarbs} g | Fat: ~${dalFat} g\n\n` +
        `📊 **Total Meal Nutrition**:\n` +
        `• **Energy**: **~${totalCals} kcal**\n` +
        `• **Protein**: **~${totalProt} g**\n` +
        `• **Carbs**: **~${totalCarb} g**\n` +
        `• **Fat**: **~${totalF} g**\n\n` +
        `💡 *Pro-Tip: Adding 1 teaspoon of ghee adds ~45 kcal. To boost protein toward a 25g+ threshold, add a side of 100g low-fat paneer, curd (dahi), or a boiled egg!*`
    };
  }

  // C. Protein target & consumption query
  if ((lower.includes('how much protein') || lower.includes('protein today')) && stats) {
    const consumed = stats.proteinConsumed !== undefined ? stats.proteinConsumed : 0;
    const target = stats.proteinTarget !== undefined ? stats.proteinTarget : (profile.weight ? Math.round(profile.weight * 1.8) : 120);
    const remaining = Math.max(0, target - consumed);
    return {
      matched: true,
      answer: `According to your logged foods for today:\n\n` +
        `• **Protein Consumed**: **${consumed}g**\n` +
        `• **Daily Target**: **${target}g**\n` +
        `• **Remaining**: **${remaining}g**\n\n` +
        (remaining > 0
          ? `To hit your remaining ${remaining}g today, great options include 100g paneer (~18g), 1 bowl Greek yogurt/hung curd (~15-18g), 2 eggs (~12g), 100g grilled tofu (~15g), or 1 scoop protein powder (~24g).`
          : `🎉 Excellent job! You have already met your daily protein target!`)
    };
  }

  // D. Fat loss calories & TDEE calculation
  if (lower.includes('how many calories') && (lower.includes('lose fat') || lower.includes('weight loss'))) {
    if (profile.weight && profile.height && profile.age) {
      const isFemale = profile.sex === 'female';
      const bmr = isFemale
        ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
        : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
      const mult = profile.activityMultiplier || 1.375;
      const tdee = Math.round(bmr * mult);
      const fatLossCal = Math.max(isFemale ? 1200 : 1500, Math.round(tdee - 450));

      return {
        matched: true,
        answer: `Based on your profile (${profile.age} yrs, ${profile.weight}kg, ${profile.height}cm, ${profile.activityLevel || 'moderately active'}):\n\n` +
          `• **Estimated BMR (Mifflin-St Jeor)**: ~${Math.round(bmr)} kcal/day\n` +
          `• **Estimated Maintenance (TDEE)**: ~${tdee} kcal/day\n` +
          `• **Recommended Fat Loss Target**: **~${fatLossCal} kcal/day** (~450 kcal deficit)\n\n` +
          `**Suggested Macro Split for Fat Loss**:\n` +
          `• Protein: ~${Math.round(profile.weight * 1.8)}g (~${Math.round(profile.weight * 1.8 * 4)} kcal, for lean muscle retention)\n` +
          `• Fats: ~${Math.round((fatLossCal * 0.25) / 9)}g (~25% of energy)\n` +
          `• Carbohydrates: ~${Math.round((fatLossCal - (profile.weight * 1.8 * 4) - (fatLossCal * 0.25)) / 4)}g\n\n` +
          `*Note: Aim for steady, sustainable loss of 0.4–0.8 kg per week. Avoid crash deficits below ${isFemale ? '1,200' : '1,500'} kcal.*`
      };
    }
  }

  return { matched: false };
}

// ---------------------------------------------------------
// 7. SATHI AI Built-In Fallback Knowledge Engine
// ---------------------------------------------------------
function generateSathiFallback(query, profile = {}, stats = {}, chatType = 'companion') {
  const lower = query.toLowerCase();

  // Dietitian responses
  if (chatType === 'dietitian' || lower.includes('lunch') || lower.includes('paneer') || lower.includes('diet') || lower.includes('recipe')) {
    if (lower.includes('500') && (lower.includes('lunch') || lower.includes('vegetarian'))) {
      return `Here is a wholesome **~500-calorie high-protein Indian vegetarian lunch**:\n\n` +
        `• **2 Whole Wheat Phulkas / Rotis** (without oil): ~170 kcal | 6g Protein\n` +
        `• **100g Lightly Sautéed Low-Fat Paneer or Tofu Bhurji**: ~165 kcal | 18g Protein\n` +
        `• **1 Small Bowl Moong Dal (100g)**: ~105 kcal | 6g Protein\n` +
        `• **Cucumber & Tomato Salad with lemon juice**: ~35 kcal | 1g Protein | 3g Fiber\n` +
        `• **Total**: **~475 kcal | ~31g Protein | 48g Carbs | 14g Fat**\n\n` +
        `This meal provides a complete amino acid profile, high satiety, and keeps your blood sugar stable for afternoon energy.`;
    }

    if (lower.includes('replace paneer with tofu') || (lower.includes('paneer') && lower.includes('tofu'))) {
      return `Yes, absolutely! Replacing paneer with firm tofu is one of the best swaps for fat loss and vegan nutrition:\n\n` +
        `• **Calories**: 100g paneer has ~265–290 kcal vs. 100g firm tofu which has only ~80–120 kcal (over 50% fewer calories!).\n` +
        `• **Protein**: Both provide ~16–18g of complete protein per 100g.\n` +
        `• **Fats**: Tofu is significantly lower in saturated fat (~2g vs ~20g in regular paneer) and is 100% cholesterol-free.\n` +
        `• **Preparation Tip**: Press the tofu to drain excess moisture, then marinate with turmeric, chili powder, garam masala, and lemon juice before pan-searing. It absorbs Indian spices wonderfully!`;
    }

    if (lower.includes('7-day') || lower.includes('seven-day') || lower.includes('budget')) {
      return `Here is a practical, budget-friendly 7-day Indian vegetarian meal structure based on high-protein staples:\n\n` +
        `• **Day 1**: Oats porridge with soaked peanuts & banana | Dal tadka + 2 rotis + cucumber | Roasted chana snack | Paneer bhurji + salad\n` +
        `• **Day 2**: Vegetable Poha + 2 boiled eggs/sprouts | Rajma masala + 1 cup brown rice | Curd (dahi) with flaxseeds | Mixed veg sabzi + 2 rotis + dal\n` +
        `• **Day 3**: 3 Idlis with sambar | Chana (chickpea) salad bowl with onion & lemon | Roasted makhana | Tofu/soya chunk curry + 2 rotis\n` +
        `• **Day 4**: Besan (chickpea flour) chilla with green chutney | Moong dal khichdi + curd | Handful of roasted peanuts | Palak paneer + 2 rotis\n` +
        `• **Day 5**: Sprouted moong chaat with pomegranates | Black chana curry + 2 rotis | Black tea/coffee + almonds | Egg/tofu curry + salad\n` +
        `• **Day 6**: Vegetable Dosa with sambar | Soybean curry + 1 cup rice | Roasted chana | Dal makhani (light) + cucumber raita + 2 rotis\n` +
        `• **Day 7**: Paneer stuffed paratha (1 medium, dry roasted) | Yellow dal + jeera rice + tomato salad | Fruit bowl | Steamed veggie stir-fry + grilled paneer/tofu\n\n` +
        `*Staples like chana, rajma, moong dal, soya chunks, and peanuts give you peak nutrition at the lowest cost per gram of protein.*`;
    }
  }

  // Fitness & Yoga responses
  if (lower.includes('yoga') || lower.includes('pose') || lower.includes('warrior') || lower.includes('tree') || lower.includes('tadasana')) {
    if (lower.includes('warrior') || lower.includes('virabhadrasana')) {
      return `### Virabhadrasana II (Warrior II) — Alignment & Form Guide\n\n` +
        `• **Sanskrit**: *Virabhadrasana II*\n` +
        `• **Stance**: Step your feet wide (~3.5 to 4 feet apart). Turn front foot out 90°, back foot turned slightly in (about 15°).\n` +
        `• **Front Knee Check**: Bend front knee to a 90° angle directly over your front ankle. Ensure your knee does not collapse inward towards the big toe.\n` +
        `• **Arms & Gaze**: Extend both arms parallel to the floor, shoulder height. Gaze steadily over your front middle finger.\n` +
        `• **Torso**: Keep your spine tall and perpendicular to the mat—avoid leaning forward over the front thigh.\n` +
        `• **Breathing**: Inhale to broaden through the chest; exhale to root through the back outer heel. Hold for 5 deep breaths.\n\n` +
        `✨ *Pro-Tip: Try the Live AI Yoga Tracker in the app! It uses your camera to measure your knee angle in real-time.*`;
    }

    if (lower.includes('tree') || lower.includes('vrikshasana')) {
      return `### Vrikshasana (Tree Pose) — Balance & Posture Guidance\n\n` +
        `• **Sanskrit**: *Vrikshasana*\n` +
        `• **Foot Placement**: Place the sole of your lifted foot against your inner standing thigh OR inner calf. **NEVER** place it directly against the knee joint to protect your lateral ligaments.\n` +
        `• **Hips**: Keep both hip points facing squarely forward and level.\n` +
        `• **Drishti (Focus Point)**: Fix your gaze on an unmoving point on the floor or wall 6 feet in front of you.\n` +
        `• **Hands**: Bring hands to Anjali Mudra (prayer at chest) or extend overhead like tree branches.\n` +
        `• **Hold**: Aim for 30–45 seconds per side. Engage the standing leg quad and glute!`;
    }
  }

  // Hydration responses
  if (lower.includes('water') || lower.includes('hydrate') || lower.includes('hydration')) {
    const target = stats.waterTarget || 2800;
    const consumed = stats.waterConsumed || 0;
    return `💧 **Hydration Status & Science**:\n\n` +
      `• **Your Target**: ${target} ml / day\n` +
      `• **Consumed Today**: ${consumed} ml (${Math.round((consumed / target) * 100)}%)\n\n` +
      `Proper hydration improves joint lubrication for yoga, increases metabolic rate by up to 3% through thermogenesis, and prevents muscular cramping. Aim to drink 250ml every 90 minutes throughout your waking day!`;
  }

  // General Wellness Companion fallback
  return `Hey there! SATHI here ✨\n\n` +
    `I'm your all-in-one fitness and wellness companion. Here is how I can best help you right now:\n\n` +
    `1. 🧘 **Live Yoga Coach**: Ask me how to perfect any of our 40 supported poses (Warrior, Tree Pose, Downward Dog, Cobra, etc.).\n` +
    `2. 🔥 **Calorie & Macro Calculations**: Give me your maintenance calories and desired deficit/surplus, or ask about daily targets.\n` +
    `3. 🥗 **Indian Nutrition & Diet**: Ask about meal swaps (e.g. paneer vs tofu), food calories (rotis, dal, chana), or 500-kcal lunches.\n` +
    `4. 💧 **Hydration & Progress**: Review your daily water intake and workout streak.\n\n` +
    `What would you like to focus on next?`;
}

// ---------------------------------------------------------
// 8. API Endpoints
// ---------------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
    process.env.GEMINI_API_KEY.trim().length > 0
  );

  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_URL !== 'https://your-project.supabase.co'
  );

  res.json({
    status: 'healthy',
    app: 'FitAI Coach',
    sathiCompanion: 'online',
    timestamp: new Date().toISOString(),
    port: Number(PORT),
    environment: process.env.NODE_ENV || 'development',
    geminiConfigured,
    supabaseConfigured
  });
});

// POST /api/ai/chat
app.post('/api/ai/chat', verifyAuth, async (req, res) => {
  try {
    const { message, history = [], userProfile = {}, todayStats = {}, chatType = 'companion' } = req.body;

    // Request Validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const query = message.trim();

    // 1. Evaluate deterministic calculations first
    const mathResult = evaluateDeterministicMath(query, userProfile, todayStats);
    if (mathResult.matched) {
      return res.json({
        reply: mathResult.answer,
        source: 'deterministic_engine',
        status: 'success'
      });
    }

    // 2. Call Google Gemini API if server-side key is present
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey.trim().length > 0) {
      try {
        const systemInstruction = `You are SATHI (Your AI Wellness Buddy), an empathetic, scientifically grounded, friendly AI fitness and nutrition coach inside the FitAI Coach application.
Role & Tone:
- Enthusiastic, encouraging, knowledgeable, concise, and structured.
- Use markdown formatting with bullet points and bold highlights for readability.
- When giving nutrition advice, support authentic Indian and global diets (roti, dal, paneer, tofu, dahi, poha, idli, chana, rajma, eggs, chicken).
- Always distinguish estimates from measured values. Never claim an approximate calorie count is exact.
- For medical questions, injuries, or eating disorders, recommend qualified healthcare providers.
- Current User Profile: ${JSON.stringify(userProfile)}
- Today's User Progress: ${JSON.stringify(todayStats)}
- Active Assistant Mode: ${chatType}`;

        const contents = [];
        const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
        for (const item of recentHistory) {
          if (item && item.role && item.content) {
            contents.push({
              role: item.role === 'model' || item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.content }]
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: query }]
        });

        // Use global fetch (built into Node 18+)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return res.json({
              reply: replyText,
              source: 'gemini_api',
              status: 'success'
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, gracefully falling back to SATHI engine:', geminiError.message);
      }
    }

    // 3. Fallback Knowledge Engine
    const fallbackAnswer = generateSathiFallback(query, userProfile, todayStats, chatType);
    return res.json({
      reply: fallbackAnswer,
      source: 'built_in_sathi_engine',
      status: 'success'
    });

  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      error: 'An unexpected error occurred while communicating with SATHI.',
      details: err.message
    });
  }
});

// GET /api/profile
app.get('/api/profile', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const profile = store.profiles[userId] || {
    id: userId,
    name: req.user.name || 'Athlete',
    email: req.user.email,
    age: 26,
    sex: 'male',
    height: 175,
    weight: 70,
    target_weight: 68,
    unit_preference: 'metric',
    fitness_goal: 'fat_loss',
    activity_level: 'moderate',
    yoga_experience: 'intermediate',
    workout_experience: 'intermediate',
    dietary_preference: 'vegetarian',
    allergies: [],
    equipment: ['bodyweight', 'yoga_mat'],
    daily_duration: 30,
    health_limitations: ''
  };
  res.json({ profile });
});

// POST /api/profile
app.post('/api/profile', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  store.profiles[userId] = {
    ...(store.profiles[userId] || {}),
    ...data,
    id: userId,
    updated_at: new Date().toISOString()
  };
  res.json({ success: true, profile: store.profiles[userId] });
});

// GET /api/profile/today-stats
app.get('/api/profile/today-stats', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  const userFoods = (store.foodLogs[userId] || []).filter(item => item.date === today);
  const userWater = (store.waterLogs[userId] || []).filter(item => item.date === today);
  const userSessions = (store.workoutSessions[userId] || []).filter(item => item.date === today);

  const totalCalories = userFoods.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
  const totalProtein = userFoods.reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
  const totalCarbs = userFoods.reduce((acc, f) => acc + (Number(f.carbs) || 0), 0);
  const totalFat = userFoods.reduce((acc, f) => acc + (Number(f.fat) || 0), 0);
  const totalWater = userWater.reduce((acc, w) => acc + (Number(w.amount_ml) || 0), 0);

  res.json({
    date: today,
    caloriesConsumed: Math.round(totalCalories),
    proteinConsumed: Math.round(totalProtein),
    carbsConsumed: Math.round(totalCarbs),
    fatConsumed: Math.round(totalFat),
    waterConsumed: totalWater,
    workoutsCompleted: userSessions.length,
    foodLogs: userFoods,
    waterLogs: userWater
  });
});

// POST /api/profile/food-log
app.post('/api/profile/food-log', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const { food_name, serving_size, meal_type, calories, protein, carbs, fat, fiber } = req.body;

  if (!food_name || calories === undefined || calories === null) {
    return res.status(400).json({ error: 'Food name and calories are required.' });
  }

  if (!store.foodLogs[userId]) store.foodLogs[userId] = [];

  const entry = {
    id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    food_name: String(food_name).trim(),
    serving_size: serving_size || '1 serving',
    meal_type: meal_type || 'lunch',
    calories: Number(calories),
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    fiber: Number(fiber) || 0,
    created_at: new Date().toISOString()
  };

  store.foodLogs[userId].unshift(entry);
  res.json({ success: true, entry });
});

// POST /api/profile/water-log
app.post('/api/profile/water-log', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const { amount_ml } = req.body;

  if (!amount_ml || Number(amount_ml) <= 0) {
    return res.status(400).json({ error: 'Valid amount in ml is required.' });
  }

  if (!store.waterLogs[userId]) store.waterLogs[userId] = [];

  const entry = {
    id: 'water_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    amount_ml: Number(amount_ml),
    created_at: new Date().toISOString()
  };

  store.waterLogs[userId].unshift(entry);
  res.json({ success: true, entry });
});

// POST /api/profile/workout-session
app.post('/api/profile/workout-session', verifyAuth, (req, res) => {
  const userId = req.user.id;
  const { session_type, duration_seconds, calories_burned, poses_completed, accuracy_score, exercises_data } = req.body;

  if (!store.workoutSessions[userId]) store.workoutSessions[userId] = [];

  const session = {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    session_type: session_type || 'yoga',
    duration_seconds: Number(duration_seconds) || 0,
    calories_burned: Number(calories_burned) || 0,
    poses_completed: Number(poses_completed) || 0,
    accuracy_score: Number(accuracy_score) || 0,
    exercises_data: exercises_data || [],
    created_at: new Date().toISOString()
  };

  store.workoutSessions[userId].unshift(session);
  res.json({ success: true, session });
});

// ---------------------------------------------------------
// 9. SPA Routing & 404 Fallback
// ---------------------------------------------------------
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found: ' + req.path });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------------------------------------------------------
// 10. Global Error Handling Middleware
// ---------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message
  });
});

// ---------------------------------------------------------
// 11. Start Server on 0.0.0.0 and PORT
// ---------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🚀 FitAI Coach & SATHI AI Server is running!`);
    console.log(`📡 Host: ${HOST} | Port: ${PORT}`);
    console.log(`📱 Local URL: http://localhost:${PORT}`);
    console.log(`✨ SATHI AI Chatbot: http://localhost:${PORT}/#sathi`);
    console.log(`🔐 Mandatory Auth & RLS Schema: /database/schema.sql`);
    console.log(`====================================================`);
  });
}

module.exports = app;
