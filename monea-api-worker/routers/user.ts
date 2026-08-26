import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"
import { CryptoUtils } from "@/lib/crypto"
import { ROLES } from "@/lib/constants"

export const userRouter = new Hono()
export const usersRouter = new Hono()

// Account deletion (mapped to /api/user/account)
userRouter.delete('/account', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user || user.type !== "admin") {
            return c.json({ error: "Unauthorized" }, 401);
        }

        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON" }, 400);
        }
        const { password } = body;

        if (!password) {
            return c.json({ error: "សូមបញ្ចូលលេខសម្ងាត់ដើម្បីបញ្ជាក់" }, 400);
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId || (user as any).id },
            select: { id: true, password: true, email: true }
        });

        if (!dbUser) {
            return c.json({ error: "រកមិនឃើញគណនីរបស់អ្នកទេ" }, 404);
        }

        if (!dbUser.password) {
            return c.json({ error: "គណនីនេះពុំមានលេខសម្ងាត់" }, 400);
        }

        const isMatch = await CryptoUtils.compare(password, dbUser.password);
        if (!isMatch) {
            await prisma.securityLog.create({
                data: {
                    event: "PASSWORD_CHANGE_FAILED",
                    ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
                    email: dbUser.email,
                    details: "Incorrect password for account deletion attempt"
                }
            });
            return c.json({ error: "លេខសម្ងាត់មិនត្រឹមត្រូវទេ" }, 400);
        }

        try {
            await prisma.user.update({
                where: { id: user.userId || (user as any).id },
                data: { deletedAt: new Date() }
            });
        } catch (e) {
            await (prisma as any).$executeRaw`UPDATE "User" SET "deletedAt" = ${new Date()} WHERE "id" = ${user.userId || (user as any).id}`;
        }

        const cookieOptions = {
            httpOnly: true,
            expires: new Date(0),
            path: "/",
            sameSite: "lax" as const
        };
        setCookie(c, "token", "", cookieOptions);
        setCookie(c, "staff_token", "", cookieOptions);
        setCookie(c, "auth_token", "", cookieOptions);

        return c.json({ success: true, message: "គណនីត្រូវបានលុបដោយជោគជ័យ" });
    } catch (error: any) {
        console.error("Account Deletion Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// User listing and management (mapped to /api/users)
usersRouter.get('/', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return c.json({ error: "Unauthorized" }, 403);
    }

    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true }
    });

    return c.json(users);
});

usersRouter.put('/', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return c.json({ error: "Unauthorized" }, 403);
    }

    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }
    const { id, role } = body;

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { role }
    });

    return c.json(updatedUser);
});

export default userRouter;
