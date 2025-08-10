import { Redis } from "@upstash/redis";
import { prisma } from "./prisma";

const redis = Redis.fromEnv();

function secondsUntilNextUtcMidnight(): number {
  const now = new Date();
  const nextMidnightUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return Math.ceil((nextMidnightUtc.getTime() - now.getTime()) / 1000);
}

function todayKey(userId: string) {
  const day = new Date().toISOString().split("T")[0]; 
  return `daily:${userId}:${day}:calls`;
}

export async function checkDailyLimit(userId: string) {
  try {
    return await checkRedisLimit(userId);
  } catch (err) {
    console.error("Redis check failed, falling back to DB:", err);
    return await checkDatabaseLimit(userId);
  }
}

export async function incrementUsage(userId: string) {
  try {
    return await incrementRedisUsage(userId);
  } catch (err) {
    console.error("Redis increment failed, falling back to DB:", err);
    return await incrementDatabaseUsage(userId);
  }
}


async function checkRedisLimit(userId: string) {
  const key = todayKey(userId);

  const raw = await redis.get(key);
  const calls = raw ? Number(raw) : 0;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyAllowance: true },
  });
  if (!user) return { ok: false, error: "User not found" };

  const limit = user.dailyAllowance ?? 5;
  const remaining = Math.max(limit - calls, 0);

  if (calls >= limit) {
    return { ok: false, error: "Daily limit reached", used: calls, limit, remaining: 0 };
  }
  return { ok: true, used: calls, limit, remaining };
}

async function incrementRedisUsage(userId: string) {
  const key = todayKey(userId);

  const newValRaw: any = await redis.incr(key);
  const newVal = Number(newValRaw);

  if (newVal === 1) {
    try {
      const ttl = secondsUntilNextUtcMidnight();
      await redis.expire(key, ttl);
    } catch (err) {
      console.error("Failed to set TTL on redis key:", err);
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyAllowance: true },
  });
  if (!user) return { ok: false, error: "User not found" };

  const limit = user.dailyAllowance ?? 5;

  if (newVal > limit) {
    return { ok: false, error: "Daily limit reached", used: newVal, limit, remaining: 0 };
  }

  return { ok: true, used: newVal, limit, remaining: Math.max(limit - newVal, 0) };
}


async function checkDatabaseLimit(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyAllowance: true },
  });
  if (!user) return { ok: false, error: "User not found" };

  const current = await prisma.userDailyLimit.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  const used = current?.callsUsed ?? 0;
  const limit = user.dailyAllowance ?? 5;
  const remaining = Math.max(limit - used, 0);

  if (used >= limit) {
    return { ok: false, error: "Daily limit reached", used, limit, remaining: 0 };
  }
  return { ok: true, used, limit, remaining };
}

async function incrementDatabaseUsage(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const upserted = await prisma.userDailyLimit.upsert({
    where: { userId_date: { userId, date: today } },
    update: { callsUsed: { increment: 1 } },
    create: { userId, date: today, callsUsed: 1 },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyAllowance: true },
  });
  if (!user) return { ok: false, error: "User not found" };

  const limit = user.dailyAllowance ?? 5;
  const used = upserted.callsUsed;
  const remaining = Math.max(limit - used, 0);

  if (used > limit) {
    return { ok: false, error: "Daily limit reached", used, limit, remaining: 0 };
  }

  return { ok: true, used, limit, remaining };
}
