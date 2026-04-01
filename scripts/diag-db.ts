
import { prisma } from "../src/lib/prisma";

async function describe() {
    try {
        console.log("---- TABLE: SystemConfig ----");
        const configCols = await (prisma as any).$queryRawUnsafe(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'SystemConfig'
        `);
        console.log(JSON.stringify(configCols, null, 2));

        console.log("---- TABLE: Broadcast ----");
        const broadcastCols = await (prisma as any).$queryRawUnsafe(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Broadcast'
        `);
        console.log(JSON.stringify(broadcastCols, null, 2));
    } catch (e) {
        console.error("DIAGNOSTIC FAILED:", e);
    }
}

describe();
