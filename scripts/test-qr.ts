
import { PaymentService } from "../src/services/PaymentService";

async function test() {
    try {
        console.log("---- STARTING TEST ----");
        const result = await PaymentService.generateKHQR({
            amount: 9,
            currency: "USD",
            merchantName: "MONEA",
            accountID: "seab_koeurn@bkrt",
            orderId: "TEST-" + Date.now(),
            weddingId: undefined
        });
        console.log("SUCCESS:", JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.error("FAILED ERROR:", e);
        console.error("STK:", e.stack);
    }
}

test().then(() => console.log("---- TEST END ----"));
