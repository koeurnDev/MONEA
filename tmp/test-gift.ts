import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { GiftService } from "../src/services/GiftService";

const prisma = new PrismaClient();

async function test() {
    console.log("Starting GiftService test...");
    try {
        const wedding = await prisma.wedding.findFirst();
        if (!wedding) {
            console.error("No wedding found in DB to test with.");
            return;
        }

        console.log(`Testing with wedding ID: ${wedding.id}`);
        const gift = await GiftService.createGift(wedding.id, {
            amount: 10,
            currency: "USD",
            method: "CASH",
            guestName: "Test Guest " + Date.now()
        });

        console.log("Success! Gift created:", gift);
    } catch (error: any) {
        console.error("CRITICAL ERROR during test:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
