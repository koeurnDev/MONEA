import { KHQR, TAG, CURRENCY, COUNTRY } from "ts-khqr";

const args = process.argv.slice(2);
const payload = JSON.parse(args[0]);

try {
    const result = KHQR.generate({
        tag: TAG.INDIVIDUAL,
        accountID: payload.accountID || "koeurn_seab@wing",
        merchantName: payload.merchantName || "MONEA",
        amount: payload.amount,
        currency: payload.currency === "USD" ? CURRENCY.USD : CURRENCY.KHR,
        countryCode: COUNTRY.KH,
        expirationTimestamp: Date.now() + 5 * 60 * 1000,
        additionalData: {
            billNumber: payload.orderId
        }
    });

    if (result.status.code !== 0 || !result.data) {
        process.stdout.write(JSON.stringify({ error: result.status.message || "Failed" }));
    } else {
        process.stdout.write(JSON.stringify({ qr: result.data.qr, md5: result.data.md5 }));
    }
} catch (e) {
    process.stdout.write(JSON.stringify({ error: e.message }));
}
