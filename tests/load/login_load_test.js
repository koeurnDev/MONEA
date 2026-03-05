import http from 'k6/http';
import { check, sleep } from 'k6';

// Run with: k6 run tests/load/login_load_test.js
export const options = {
    stages: [
        { duration: '10s', target: 20 }, // Ramp up to 20 users
        { duration: '30s', target: 50 }, // Spike to 50 concurrent users
        { duration: '10s', target: 0 },  // Ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be < 500ms
    },
};

export default function () {
    const url = 'http://localhost:3000/api/auth/login';

    const payload = JSON.stringify({
        email: `test_user_${__VU}@example.com`,
        password: 'WrongPassword123!',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            // Simulating different IPs using x-forwarded-for to test GeoIP/IP blocking safely
            // Careful: This will trigger the Security IP blockers!
            'x-forwarded-for': `192.168.1.${__VU}`,
            'x-vercel-ip-country': 'KH'
        },
    };

    const res = http.post(url, payload, params);

    // We expect a 401 (Invalid Credentials) or 403/429 depending on blocking thresholds
    check(res, {
        'is status 401 or 429': (r) => r.status === 401 || r.status === 429 || r.status === 403,
    });

    // Short pause between iterations
    sleep(1);
}
