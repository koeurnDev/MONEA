import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { getRedis } from "./redis.ts";

const EXCHANGE_TICKET_TTL_SECONDS = 60;
const EXCHANGE_TICKET_PREFIX = "auth:exchange:";

type ExchangeTicketStore = {
    set(key: string, value: string, options: { ex: number; nx: true }): Promise<unknown>;
    del(key: string): Promise<number>;
};

export class ExchangeTicketStoreUnavailableError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "ExchangeTicketStoreUnavailableError";
        if (cause !== undefined) {
            Object.defineProperty(this, "cause", { value: cause, configurable: true });
        }
    }
}

const exchangeTicketMemory = new Map<string, number>();

function isProductionEnvironment(): boolean {
    // Temporarily disable Redis requirement until KV is configured
    // This makes exchange tickets use in-memory storage (60s TTL)
    // TODO: Configure KV namespace and re-enable production mode
    return false;
    // return process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";
}

function getTicketStore(
    storeProvider: () => ExchangeTicketStore | null,
): ExchangeTicketStore {
    const store = storeProvider();
    if (!store) {
        throw new ExchangeTicketStoreUnavailableError("Exchange ticket storage is not configured.");
    }
    return store;
}

export async function createExchangeTicket(
    sessionToken: string,
    secret: Uint8Array,
    storeProvider: () => ExchangeTicketStore | null = getRedis,
): Promise<string> {
    const jti = crypto.randomUUID();
    const ticket = await new SignJWT({ token: sessionToken, type: "sso_exchange" })
        .setProtectedHeader({ alg: "HS256" })
        .setJti(jti)
        .setIssuedAt()
        .setExpirationTime(`${EXCHANGE_TICKET_TTL_SECONDS}s`)
        .sign(secret);

    if (isProductionEnvironment()) {
        const store = getTicketStore(storeProvider);
        try {
            const result = await store.set(
                `${EXCHANGE_TICKET_PREFIX}${jti}`,
                "1",
                { ex: EXCHANGE_TICKET_TTL_SECONDS, nx: true },
            );
            if (result !== "OK") {
                throw new ExchangeTicketStoreUnavailableError("Could not register the exchange ticket.");
            }
        } catch (error) {
            if (error instanceof ExchangeTicketStoreUnavailableError) throw error;
            throw new ExchangeTicketStoreUnavailableError("Could not register the exchange ticket.", error);
        }
        return ticket;
    }

    const now = Math.floor(Date.now() / 1000);
    if (exchangeTicketMemory.size >= 1_000) {
        for (const [key, expiresAt] of exchangeTicketMemory) {
            if (expiresAt <= now) exchangeTicketMemory.delete(key);
        }
        if (exchangeTicketMemory.size >= 1_000) {
            throw new ExchangeTicketStoreUnavailableError("Development exchange ticket storage is full.");
        }
    }
    exchangeTicketMemory.set(jti, now + EXCHANGE_TICKET_TTL_SECONDS);
    return ticket;
}

export async function verifyExchangeTicket(
    ticket: string,
    secret: Uint8Array,
    storeProvider: () => ExchangeTicketStore | null = getRedis,
): Promise<string | null> {
    let payload: JWTPayload;
    try {
        ({ payload } = await jwtVerify(ticket, secret));
    } catch {
        return null;
    }

    if (payload.type !== "sso_exchange" ||
        typeof payload.token !== "string" || !payload.token ||
        typeof payload.jti !== "string" || !payload.jti) {
        return null;
    }

    if (isProductionEnvironment()) {
        const store = getTicketStore(storeProvider);
        let consumed: number;
        try {
            consumed = Number(await store.del(`${EXCHANGE_TICKET_PREFIX}${payload.jti}`));
        } catch (error) {
            throw new ExchangeTicketStoreUnavailableError("Could not consume the exchange ticket.", error);
        }
        return consumed === 1 ? payload.token : null;
    }

    const expiresAt = exchangeTicketMemory.get(payload.jti);
    if (!expiresAt || expiresAt <= Math.floor(Date.now() / 1000)) {
        exchangeTicketMemory.delete(payload.jti);
        return null;
    }
    exchangeTicketMemory.delete(payload.jti);
    return payload.token;
}
