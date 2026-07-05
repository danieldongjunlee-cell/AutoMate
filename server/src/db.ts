import { PrismaClient } from '@prisma/client';

import './config'; // ensure .env is loaded before the adapter reads DATABASE_URL
import { makeAdapter } from './prismaAdapter';

/** Single PrismaClient for the whole process (Prisma 7 pg driver adapter). */
export const prisma = new PrismaClient({ adapter: makeAdapter() });

/**
 * Append a points-ledger entry and return the new balance.
 * `delta` is positive for earn, negative for redeem.
 */
export async function awardPoints(userId: string, delta: number, reason: string) {
  const agg = await prisma.pointsLedgerEntry.aggregate({
    where: { userId },
    _sum: { delta: true },
  });
  const balance = (agg._sum.delta ?? 0) + delta;
  if (balance < 0) throw Object.assign(new Error('Insufficient points'), { status: 400 });
  await prisma.pointsLedgerEntry.create({
    data: { userId, delta, reason, balanceAfter: balance },
  });
  return balance;
}
