
import { prisma } from "../src/lib/prisma";

async function test() {
    const count = await prisma.wedding.count();
    console.log("WEDDING COUNT:", count);
}
test();
