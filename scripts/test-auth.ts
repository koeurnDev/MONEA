import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const prisma = new PrismaClient();

async function impersonate() {
  const user = await prisma.user.findFirst({
    where: { role: "SUPERADMIN" },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    console.log("No superadmin found");
    return;
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "monea-dev-secret-do-not-use-in-prod-1234567890");
  const token = await new SignJWT({ 
    userId: user.id, 
    email: user.email, 
    role: user.role,
    fingerprint: "hash" 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("MONEA_AUTH_INTERNAL")
    .setExpirationTime("24h")
    .sign(secret);

  console.log("Simulating token for:", user.email, "id:", user.id);
  
  const res = await fetch("http://localhost:3001/api/admin/health", {
    headers: {
      Cookie: "token=" + token
    }
  });

  console.log("Status:", res.status);
  console.log("Text:", await res.text());
}

impersonate().then(() => prisma.$disconnect());
