import {
  EARN_REASONS,
  EARN_RULES,
  EarnRule,
  POINT_VALUE_USD,
} from '../../config/points';
import { useAppStore } from '../../store/useAppStore';
import { delay } from './delay';

/** One entry in the points ledger (mirrors server points_ledger rows). */
export interface PointsLedgerEntry {
  id: string;
  delta: number; // + earn / − redeem
  reason: string;
  balanceAfter: number;
  createdAt: string; // ISO
}

export interface CheckInResult {
  ok: boolean;
  /** False when today's check-in already happened (idempotent per day). */
  awarded: boolean;
  pointsEarned: number;
  streakDay: number;
  balance: number;
}

/** Wireframe baseline: home shows "Day 5 streak". */
const STREAK_DAY = 5;

/** Module-level mock ledger + once-per-day check-in latch. */
let ledger: PointsLedgerEntry[] = [];
let lastCheckIn: string | null = null;
let nextId = 1;

const todayKey = () => new Date().toDateString();

/** Apply a delta to the single client cache (store.points) + mock ledger. */
function record(delta: number, reason: string): number {
  const store = useAppStore.getState();
  const balanceAfter = store.points + delta;
  // Pass the reason so the Supabase points ledger records what it was for.
  store.addPoints(delta, reason);
  ledger = [
    {
      id: `pl-${nextId++}`,
      delta,
      reason,
      balanceAfter,
      createdAt: new Date().toISOString(),
    },
    ...ledger,
  ];
  return balanceAfter;
}

export const pointsService = {
  /** Current balance — store.points is the single client cache. */
  async getBalance(): Promise<number> {
    await delay(150);
    return useAppStore.getState().points;
  },

  async getLedger(): Promise<PointsLedgerEntry[]> {
    await delay(250);
    return [...ledger];
  },

  /** Award points for an earn rule (config/points EARN_RULES). */
  async earn(rule: EarnRule, reason?: string) {
    await delay(250);
    const pointsEarned = EARN_RULES[rule];
    const balance = record(pointsEarned, reason ?? EARN_REASONS[rule]);
    return { ok: true as const, pointsEarned, balance };
  },

  /** Redeem (subtract) points, e.g. against a service payment. */
  async redeem(points: number, reason = 'Redeemed at checkout') {
    await delay(350);
    const current = useAppStore.getState().points;
    if (!Number.isFinite(points) || points <= 0 || points > current) {
      throw new Error('Insufficient points');
    }
    const balance = record(-Math.round(points), reason);
    return {
      ok: true as const,
      balance,
      dollarValue: Number((points * POINT_VALUE_USD).toFixed(2)),
    };
  },

  /** Daily check-in: +10 pts, idempotent per calendar day (module latch). */
  async checkIn(): Promise<CheckInResult> {
    await delay(200);
    const today = todayKey();
    if (lastCheckIn === today) {
      return {
        ok: true,
        awarded: false,
        pointsEarned: 0,
        streakDay: STREAK_DAY,
        balance: useAppStore.getState().points,
      };
    }
    lastCheckIn = today;
    const balance = record(EARN_RULES.dailyCheckIn, EARN_REASONS.dailyCheckIn);
    return {
      ok: true,
      awarded: true,
      pointsEarned: EARN_RULES.dailyCheckIn,
      streakDay: STREAK_DAY,
      balance,
    };
  },
};
