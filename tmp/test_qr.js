const { PaymentService } = require('./src/services/PaymentService');

async function testQR() {
    console.log("Testing KHQR Generation...");
    try {
        const result = await PaymentService.generateKHQR({
            amount: 0.1,
            currency: "USD",
            merchantName: "TEST MONEA",
            accountID: "seab_koeurn@bkrt",
            orderId: "TEST-" + Date.now()
        });
        console.log("SUCCESS! QR generated:", result.qr.substring(0, 30) + "...");
        console.log("MD5:", result.md5);
    } catch (e) {
        console.error("FAILURE:", e.message);
    }
}

// Need to mock prisma for this test since we are running outside Next.js
// Actually, I'll just check if it loads.
testQR();
