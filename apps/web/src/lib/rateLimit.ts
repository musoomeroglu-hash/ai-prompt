type RateLimitContext = {
    id: string;
    limit: number;
    duration: number; // in seconds
};

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

const store = new Map<string, { count: number; reset: number }>();

export async function rateLimit(context: RateLimitContext): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - context.duration * 1000;

    const key = context.id;
    let record = store.get(key);

    if (!record || record.reset < now) {
        record = { count: 0, reset: now + context.duration * 1000 };
        store.set(key, record);
    }

    record.count += 1;
    const success = record.count <= context.limit;

    return {
        success,
        limit: context.limit,
        remaining: Math.max(0, context.limit - record.count),
        reset: record.reset,
    };
}
