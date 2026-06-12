/** Real points service (server/ /points routes) — mirrors services/mock/pointsService. */
import { EARN_REASONS, EARN_RULES, EarnRule } from '../../config/points';
import { useAppStore } from '../../store/useAppStore';
import type { CheckInResult, PointsLedgerEntry } from '../mock/pointsService';
import { request } from './client';

/** Reconcile the single client cache (store.points) with the server balance. */
function syncBalance(balance: number) {
  useAppStore.getState().setPoints(balance);
}

export const pointsService = {
  async getBalance(): Promise<number> {
    const { balance } = await request<{ balance: number }>('/points');
    syncBalance(balance);
    return balance;
  },

  async getLedger(): Promise<PointsLedgerEntry[]> {
    const { balance, ledger } = await request<{
      balance: number;
      ledger: PointsLedgerEntry[];
    }>('/points');
    syncBalance(balance);
    return ledger;
  },

  async earn(rule: EarnRule, reason?: string) {
    const pointsEarned = EARN_RULES[rule];
    const { balance } = await request<{ ok: boolean; balance: number }>('/points/earn', {
      body: { points: pointsEarned, reason: reason ?? EARN_REASONS[rule] },
    });
    syncBalance(balance);
    return { ok: true as const, pointsEarned, balance };
  },

  async redeem(points: number, reason = 'Redeemed at checkout') {
    const { balance, dollarValue } = await request<{
      ok: boolean;
      balance: number;
      dollarValue: number;
    }>('/points/redeem', { body: { points, reason } });
    syncBalance(balance);
    return { ok: true as const, balance, dollarValue };
  },

  async checkIn(): Promise<CheckInResult> {
    const result = await request<CheckInResult>('/points/check-in', { body: {} });
    syncBalance(result.balance);
    return result;
  },
};
