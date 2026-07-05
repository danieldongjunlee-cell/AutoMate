/** Real quote service (server/) — mirrors services/mock/quoteService. */
import { AiEstimateSummary, Quote, QUOTE_REQUEST } from '../mock/data';
import { request } from './client';

export const quoteService = {
  async getQuoteRequest() {
    return request<typeof QUOTE_REQUEST>('/quotes/request');
  },

  async getQuotes(): Promise<Quote[]> {
    return request<Quote[]>('/quotes');
  },

  async submitDamageRequest(
    parts: { part: string; type: string; photos: number; note?: string }[],
  ) {
    return request<{
      shopsNotified: number;
      etaHours: string;
      submittedAt: string;
      afterHours: boolean;
      pointsEarned: number;
      /** From the damage-ai service (or the server's deterministic fallback). */
      aiEstimate: AiEstimateSummary;
    }>('/quotes/submit', { body: { parts } });
  },

  async acceptQuote(quoteId: string) {
    return request<{ ok: boolean; quoteId: string }>(
      `/quotes/${encodeURIComponent(quoteId)}/accept`,
      { method: 'POST', body: {} },
    );
  },

  async bookAppointment(dealerId: string, dateLabel: string, time: string) {
    return request<{ ok: boolean; reminder: string; pointsEarned: number }>('/bookings', {
      body: { dealerId, dateLabel, time },
    });
  },
};
