const http = require('http');

const TARGET_URL = 'http://localhost:3001/api/auth/login';
const CONCURRENT_USERS = 50;

console.log(`🚀 Starting Node-based Load Test: ${CONCURRENT_USERS} Concurrent Logins`);
console.log('Targeting:', TARGET_URL);

async function simulateUser(userId) {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = http.request(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-forwarded-for': `10.0.1.${userId}`, // Unique IP per thread
                'x-vercel-ip-country': 'KH'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const latency = Date.now() - start;
                resolve({ id: userId, status: res.statusCode, latency });
            });
        });

        req.on('error', (e) => {
            resolve({ id: userId, status: 500, error: e.message });
        });

        // Fire request
        req.write(JSON.stringify({ email: `user_${userId}@test.com`, password: 'testPassword' }));
        req.end();
    });
}

async function runLoadTest() {
    console.log('Spawning requests...');
    const startGlobal = Date.now();

    const promises = [];
    for (let i = 1; i <= CONCURRENT_USERS; i++) {
        promises.push(simulateUser(i));
    }

    const results = await Promise.all(promises);
    const endGlobal = Date.now();

    const maxLatency = Math.max(...results.map(r => r.latency || 0));
    const avgLatency = results.reduce((acc, r) => acc + (r.latency || 0), 0) / results.length;

    console.log('\n✅ Load Test Completed in', endGlobal - startGlobal, 'ms.');
    console.log(`📊 Average Latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`⏱️ Max Latency: ${maxLatency}ms`);

    console.log('\nSample Results:');
    console.log(results.slice(0, 5));
}

runLoadTest();
