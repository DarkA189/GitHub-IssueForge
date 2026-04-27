// src/lib/rate-limit.ts
import { prisma } from './prisma';

const REQUESTS_PER_HOUR = 50;
const RESET_INTERVAL = 60 * 60 * 1000; // 1 hour

export async function checkRateLimit(userId: string): Promise<boolean> {
  const now = new Date();

  let rateLimit = await prisma.rateLimit.findUnique({
    where: { userId },
  });

  if (!rateLimit) {
    await prisma.rateLimit.create({
      data: {
        userId,
        requestCount: 1,
        resetAt: new Date(now.getTime() + RESET_INTERVAL),
      },
    });
    return true;
  }

  if (rateLimit.resetAt < now) {
    await prisma.rateLimit.update({
      where: { userId },
      data: {
        requestCount: 1,
        resetAt: new Date(now.getTime() + RESET_INTERVAL),
      },
    });
    return true;
  }

  if (rateLimit.requestCount >= REQUESTS_PER_HOUR) {
    return false;
  }

  await prisma.rateLimit.update({
    where: { userId },
    data: { requestCount: { increment: 1 } },
  });

  return true;
}

export async function getRateLimitResetTime(
  userId: string
): Promise<Date | null> {
  const rateLimit = await prisma.rateLimit.findUnique({
    where: { userId },
  });

  return rateLimit?.resetAt || null;
}