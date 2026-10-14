// test_fitai_endpoints.js
// Automated Health Check and API Endpoint Test Suite for FitAI Coach

const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          raw: data,
          json: json
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log(`🧪 Running FitAI Coach Comprehensive API & Endpoint Tests`);
  console.log(`📡 Target: ${BASE_URL}`);
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assertTest(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} — ${details}`);
    }
  }

  try {
    // 1. Static asset tests
    const staticEndpoints = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json'];
    for (const ep of staticEndpoints) {
      const res = await makeRequest(ep);
      assertTest(res.statusCode === 200, `Static Endpoint: ${ep}`, `Status ${res.statusCode}`);
    }

    // 2. Health check endpoint
    const health = await makeRequest('/api/health');
    assertTest(
      health.statusCode === 200 && health.json?.status === 'healthy' && health.json?.sathiCompanion === 'online',
      'GET /api/health returns 200 and healthy status',
      JSON.stringify(health.json)
    );

    // 3. SATHI AI Chat — Deterministic Math (Calorie Deficit Calculation)
    const mathChat = await makeRequest('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-mode': 'true'
      }
    }, {
      message: 'My maintenance is 2,400 calories. What is a 400-calorie deficit?'
    });
    assertTest(
      mathChat.statusCode === 200 &&
      mathChat.json?.source === 'deterministic_engine' &&
      mathChat.json?.reply?.includes('2,000'),
      'POST /api/ai/chat (Deterministic Deficit Math)',
      `Status: ${mathChat.statusCode}, source: ${mathChat.json?.source}, reply: ${mathChat.json?.reply?.slice(0, 60)}`
    );

    // 4. SATHI AI Chat — Indian Food Macro Breakdown (Roti and Dal)
    const foodChat = await makeRequest('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-mode': 'true'
      }
    }, {
      message: 'What are the calories in 2 rotis and 1 bowl of dal?'
    });
    assertTest(
      foodChat.statusCode === 200 &&
      foodChat.json?.source === 'deterministic_engine' &&
      foodChat.json?.reply?.includes('Rotis'),
      'POST /api/ai/chat (Indian Nutrition Deterministic Calculation)',
      `Reply: ${foodChat.json?.reply?.slice(0, 60)}`
    );

    // 5. SATHI AI Chat — Validation (Empty Message)
    const emptyChat = await makeRequest('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-mode': 'true'
      }
    }, {
      message: '   '
    });
    assertTest(
      emptyChat.statusCode === 400 && emptyChat.json?.error,
      'POST /api/ai/chat rejects empty message with 400 Bad Request',
      `Status: ${emptyChat.statusCode}`
    );

    // 6. SATHI AI Chat — Fallback Knowledge Query (Yoga Virabhadrasana)
    const yogaChat = await makeRequest('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-mode': 'true'
      }
    }, {
      message: 'How do I perform Warrior II pose?',
      chatType: 'fitness'
    });
    assertTest(
      yogaChat.statusCode === 200 &&
      yogaChat.json?.reply?.includes('Virabhadrasana II'),
      'POST /api/ai/chat (SATHI Yoga Guidance Fallback/Gemini)',
      `Reply: ${yogaChat.json?.reply?.slice(0, 60)}`
    );

    // 7. GET /api/profile (Authenticated with guest mode)
    const profileRes = await makeRequest('/api/profile', {
      method: 'GET',
      headers: { 'x-guest-mode': 'true' }
    });
    assertTest(
      profileRes.statusCode === 200 && profileRes.json?.profile?.id === 'guest-user-demo',
      'GET /api/profile returns guest athlete profile',
      JSON.stringify(profileRes.json)
    );

    // 8. POST /api/profile (Update athlete profile)
    const updateProfile = await makeRequest('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-mode': 'true'
      }
    }, {
      name: 'Test Athlete',
      weight: 72,
      target_weight: 68,
      fitness_goal: 'fat_loss'
    });
    assertTest(
      updateProfile.statusCode === 200 && updateProfile.json?.profile?.weight === 72,
      'POST /api/profile updates profile state',
      JSON.stringify(updateProfile.json)
    );

    // 9. POST /api/profile/food-log
    const foodLog = await makeRequest('/api/profile/food-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-mode': 'true'
      }
    }, {
      food_name: 'Paneer Bhurji',
      calories: 250,
      protein: 18,
      carbs: 6,
      fat: 16
    });
    assertTest(
      foodLog.statusCode === 200 && foodLog.json?.entry?.food_name === 'Paneer Bhurji',
      'POST /api/profile/food-log successfully logs meal',
      JSON.stringify(foodLog.json)
    );

    // 10. POST /api/profile/water-log
    const waterLog = await makeRequest('/api/profile/water-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-mode': 'true'
      }
    }, {
      amount_ml: 350
    });
    assertTest(
      waterLog.statusCode === 200 && waterLog.json?.entry?.amount_ml === 350,
      'POST /api/profile/water-log logs hydration intake',
      JSON.stringify(waterLog.json)
    );

    // 11. POST /api/profile/workout-session
    const sessionLog = await makeRequest('/api/profile/workout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-mode': 'true'
      }
    }, {
      session_type: 'yoga',
      duration_seconds: 900,
      calories_burned: 65,
      accuracy_score: 92
    });
    assertTest(
      sessionLog.statusCode === 200 && sessionLog.json?.session?.accuracy_score === 92,
      'POST /api/profile/workout-session logs workout session',
      JSON.stringify(sessionLog.json)
    );

    // 12. GET /api/profile/today-stats (Aggregations)
    const todayStats = await makeRequest('/api/profile/today-stats', {
      method: 'GET',
      headers: { 'x-guest-mode': 'true' }
    });
    assertTest(
      todayStats.statusCode === 200 &&
      todayStats.json?.caloriesConsumed >= 250 &&
      todayStats.json?.waterConsumed >= 350 &&
      todayStats.json?.workoutsCompleted >= 1,
      'GET /api/profile/today-stats aggregates logged nutrition, water & workouts',
      JSON.stringify(todayStats.json)
    );

    // 13. Security / Unauthenticated Request Rejection
    const unauthRes = await makeRequest('/api/profile');
    assertTest(
      unauthRes.statusCode === 401,
      'Security: Unauthenticated request to protected endpoint returns 401',
      `Status: ${unauthRes.statusCode}`
    );

    // 14. 404 on invalid API endpoint
    const notFoundApi = await makeRequest('/api/nonexistent');
    assertTest(
      notFoundApi.statusCode === 404 && notFoundApi.json?.error,
      'Non-existent /api/* endpoint returns 404 JSON',
      `Status: ${notFoundApi.statusCode}`
    );

  } catch (err) {
    console.error('Fatal test error:', err);
  }

  console.log('\n========================================================');
  console.log(`📊 Test Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================');

  if (passed === total) {
    console.log('🎉 All health and API tests passed successfully!');
    process.exit(0);
  } else {
    console.error('⚠️ Some tests failed.');
    process.exit(1);
  }
}

// Start server in-process if not already running, then test
const app = require('./server.js');
let serverInstance;

serverInstance = app.listen(PORT, '0.0.0.0', async () => {
  try {
    await runTests();
  } finally {
    serverInstance.close();
  }
});

serverInstance.on('error', async (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} already active, executing tests against running instance...`);
    await runTests();
  } else {
    console.error('Server startup error:', e);
  }
});
