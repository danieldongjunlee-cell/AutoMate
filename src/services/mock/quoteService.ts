import { Quote, QUOTE_REQUEST, QUOTES } from './data';
import { delay } from './delay';

/**
 * Business-hours rule for routing Submitted vs. After-Hours (wireframe
 * 11:48 PM variant). Owned by the service layer — the real backend will
 * decide this from dealer hours/timezone.
 */
export const isAfterHours = (d = new Date()) => d.getHours() >= 21 || d.getHours() < 7;

export const quoteService = {
  async getQuoteRequest() {
    await delay(300);
    return QUOTE_REQUEST;
  },

  async getQuotes(): Promise<Quote[]> {
    await delay(400);
    return [...QUOTES].sort((a, b) => a.price - b.price);
  },

  async submitDamageRequest(_parts: string[], _photos: number, _damageType: string) {
    await delay(700);
    return {
      shopsNotified: QUOTE_REQUEST.shopsNotified,
      etaHours: '1–3',
      submittedAt: new Date().toISOString(),
      afterHours: isAfterHours(),
      pointsEarned: 20, // "Submit damage photos" (s-prof-earn)
    };
  },

  async acceptQuote(quoteId: string) {
    await delay(400);
    return { ok: true, quoteId };
  },

  async bookAppointment(_dealerId: string, _dateLabel: string, _time: string) {
    await delay(600);
    return { ok: true, reminder: '1 day before', pointsEarned: 50 }; // "Book service via app"
  },
};
