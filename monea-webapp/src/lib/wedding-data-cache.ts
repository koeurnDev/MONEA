interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class WeddingDataCache<T> {
    private readonly memory = new Map<string, CacheEntry<T>>();
    private readonly storage: Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length"> | null;
    private readonly ttlMs: number;
    private readonly maxEntries: number;
    private readonly storagePrefix: string;

    constructor(
        storage: Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length"> | null,
        ttlMs: number,
        maxEntries: number,
        storagePrefix = "monea_w_",
    ) {
        this.storage = storage;
        this.ttlMs = ttlMs;
        this.maxEntries = maxEntries;
        this.storagePrefix = storagePrefix;
    }

    get(id: string, now = Date.now()): T | null {
        this.pruneMemory(now);
        const cached = this.memory.get(id);
        if (cached) return cached.data;

        if (!this.storage) return null;

        try {
            const key = `${this.storagePrefix}${id}`;
            const raw = this.storage.getItem(key);
            if (!raw) return null;

            const parsed: unknown = JSON.parse(raw);
            if (
                !parsed ||
                typeof parsed !== "object" ||
                !("data" in parsed) ||
                !("timestamp" in parsed) ||
                typeof parsed.timestamp !== "number" ||
                !Number.isFinite(parsed.timestamp)
            ) {
                this.storage.removeItem(key);
                return null;
            }

            if (now - parsed.timestamp >= this.ttlMs || parsed.timestamp > now) {
                this.storage.removeItem(key);
                return null;
            }

            const entry = parsed as CacheEntry<T>;
            this.memory.set(id, entry);
            this.pruneMemory(now);
            return entry.data;
        } catch {
            return null;
        }
    }

    set(id: string, data: T, now = Date.now()): void {
        this.memory.delete(id);
        this.memory.set(id, { data, timestamp: now });
        this.pruneMemory(now);

        if (!this.storage) return;

        try {
            const entries: Array<{ key: string; timestamp: number }> = [];
            for (let index = 0; index < this.storage.length; index += 1) {
                const key = this.storage.key(index);
                if (!key?.startsWith(this.storagePrefix)) continue;

                const raw = this.storage.getItem(key);
                try {
                    const entry = raw ? JSON.parse(raw) as Partial<CacheEntry<unknown>> : null;
                    if (
                        !entry ||
                        typeof entry.timestamp !== "number" ||
                        !Number.isFinite(entry.timestamp) ||
                        now - entry.timestamp >= this.ttlMs ||
                        entry.timestamp > now
                    ) {
                        this.storage.removeItem(key);
                        continue;
                    }
                    entries.push({ key, timestamp: entry.timestamp });
                } catch {
                    this.storage.removeItem(key);
                }
            }

            const targetKey = `${this.storagePrefix}${id}`;
            const retained = entries.filter((entry) => entry.key !== targetKey);
            retained.sort((left, right) => right.timestamp - left.timestamp);
            for (const entry of retained.slice(this.maxEntries - 1)) {
                this.storage.removeItem(entry.key);
            }
            this.storage.setItem(targetKey, JSON.stringify({ data, timestamp: now }));
        } catch {
            // Session storage is an optional acceleration; memory cache remains usable.
        }
    }

    private pruneMemory(now: number): void {
        for (const [id, entry] of this.memory) {
            if (now - entry.timestamp >= this.ttlMs || entry.timestamp > now) {
                this.memory.delete(id);
            }
        }

        while (this.memory.size > this.maxEntries) {
            const oldestId = this.memory.keys().next().value;
            if (oldestId === undefined) break;
            this.memory.delete(oldestId);
        }
    }
}
