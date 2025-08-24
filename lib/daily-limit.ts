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

function todayKey(userId: string) {
  const day = new Date().toISOString().split("T")[0];
  return `daily:${userId}:${day}`;
}

async function ensureDaySetup(
  userId: string
): Promise<{ limit: number; used: number } | null> {
  const key = todayKey(userId);

  const existing = await redis.hmget(key, "limit", "used");
  console.log("Redis HMGET result:", existing);

  let limitValue: string | null = null;
  let usedValue: string | null = null;

  if (Array.isArray(existing)) {
    limitValue = existing[0];
    usedValue = existing[1];
  } else if (existing && typeof existing === "object") {
    limitValue = (existing as any).limit;
    usedValue = (existing as any).used;
  }

  if (limitValue !== null && limitValue !== undefined) {
    const limit = parseInt(limitValue as string, 10);
    const used = parseInt((usedValue as string) || "0", 10);

    console.log("Parsed from Redis - limit:", limit, "used:", used);

    if (!isNaN(limit)) {
      return { limit, used: isNaN(used) ? 0 : used };
    }
  }

  console.log("Setting up new day for user:", userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyAllowance: true },
  });

  if (!user) {
    console.log("User not found in database");
    return null;
  }

  const limit = user.dailyAllowance ?? 5;
  const ttl = secondsUntilNextUtcMidnight();

  console.log("Setting Redis hash with limit:", limit, "ttl:", ttl);

  await redis.hset(key, {
    limit: limit.toString(),
    used: "0",
  });
  await redis.expire(key, ttl);

  return { limit, used: 0 };
}

export async function checkDailyLimit(userId: string) {
  const data = await ensureDaySetup(userId);

  if (!data) {
    return { ok: false, error: "User not found" };
  }

  const { limit, used } = data;
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
  const key = todayKey(userId);

  const pipeline = redis.pipeline();
  pipeline.hmget(key, "limit", "used");
  pipeline.hincrby(key, "used", 1);

  const results = await pipeline.exec();
  const existing = results[0] as [string | null, string | null] | null;
  const newUsed = results[1] as number;

  if (!existing || existing[0] === null) {
    const data = await ensureDaySetup(userId);
    if (!data) {
      return { ok: false, error: "User not found" };
    }

    // Increment after setup
    const actualUsed = await redis.hincrby(key, "used", 1);
    const remaining = Math.max(data.limit - actualUsed, 0);

    return { ok: true, used: actualUsed, limit: data.limit, remaining };
  }

  const limit = Number(existing[0]);
  const used = Number(newUsed);
  const remaining = Math.max(limit - used, 0);

  return { ok: true, used, limit, remaining };
}
