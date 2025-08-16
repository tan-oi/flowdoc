import { Redis } from "@upstash/redis";
import { prisma } from "./prisma";

const redis = Redis.fromEnv();

function secondsUntilNextUtcMidnight(): number {
  const now = new Date();
  const nextMidnightUtc = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  );
  return Math.ceil((nextMidnightUtc.getTime() - now.getTime()) / 1000);
}

function todayLimitKey(userId: string) {
  const day = new Date().toISOString().split("T")[0];
  return `daily:${userId}:${day}:limit`;
}

function todayCallsKey(userId: string) {
  const day = new Date().toISOString().split("T")[0];
  return `daily:${userId}:${day}:calls`;
}

async function ensureDaySetup(userId: string): Promise<number | null> {
  const limitKey = todayLimitKey(userId);
  const callsKey = todayCallsKey(userId);

  let limit = await redis.get(limitKey);

  if (limit === null) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyAllowance: true },
    });

    if (!user) return null;

    limit = user.dailyAllowance ?? 5;

    const ttl = secondsUntilNextUtcMidnight();
    await redis.set(limitKey, limit, { ex: ttl });
    await redis.set(callsKey, 0, { ex: ttl });
  }

  return Number(limit);
}
export async function checkDailyLimit(userId: string) {
  const limit = await ensureDaySetup(userId);

  if (limit === null) {
    return { ok: false, error: "User not found" };
  }

  const callsKey = todayCallsKey(userId);
  const current = await redis.get(callsKey);
  const used = current ? Number(current) : 0;
  const remaining = Math.max(limit - used, 0);

  if (used >= limit) {
    return {
      ok: false,
      error: "Daily limit reached",
      used,
      limit,
      remaining: 0,
    };
  }

  return { ok: true, used, limit, remaining };
}

export async function incrementUsage(userId: string) {
  const limit = await ensureDaySetup(userId);

  if (limit === null) {
    return { ok: false, error: "User not found" };
  }

  const callsKey = todayCallsKey(userId);
  const newUsed = await redis.incr(callsKey);
  const remaining = Math.max(limit - newUsed, 0);

  return { ok: true, used: newUsed, limit, remaining };
}
