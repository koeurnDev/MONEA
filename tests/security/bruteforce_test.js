const http = require('http');

// Run with: node tests/security/bruteforce_test.js
const TARGET_URL = 'http://localhost:3001/api/auth/login';

console.log('🚀 Starting Security Stress Test...');
console.log('Targeting:', TARGET_URL);
console.log('Goal: Trigger 15 rapid failed logins to test Exponential Backoff and IP Blocking');

async function loginAttempt(attemptNumber) {
    return new Promise((resolve) => {
        const req = http.request(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Spoofing local IP to avoid locking out your own real IP during testing
                'x-forwarded-for': '10.0.0.99',
                'x-vercel-ip-country': 'US'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[Attempt ${attemptNumber}] -> Status: ${res.statusCode} | Response: ${data}`);
                resolve(res.statusCode);
            });
        });

        req.on('error', (e) => {
            console.error(`Attempt ${attemptNumber} failed with error: ${e.message}`);
            resolve(500);
        });

        req.write(JSON.stringify({
            email: 'admin_attack_target@example.com',
            password: 'wrong_password_guess'
        }));
        req.end();
    });
}

async function runAttack() {
    const startTime = Date.now();
    for (let i = 1; i <= 15; i++) {
        const status = await loginAttempt(i);

        // We expect status to be 401 initially, then 428 (Captcha), then 429/403 (IP Blocked)
        if (status === 429 || status === 403) {
            console.log(`✅ SUCCESS: IP was successfully blocked on attempt ${i}!`);
        }
    }
    const endTime = Date.now();
    console.log(`🏁 Test completed in ${(endTime - startTime) / 1000} seconds.`);
    console.log('Please check your Telegram for the automated block alert!');
}

runAttack();
