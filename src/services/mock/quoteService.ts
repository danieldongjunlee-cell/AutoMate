import { Quote, QUOTE_REQUEST, QUOTES } from './data';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
    };
  },

  async acceptQuote(quoteId: string) {
    await delay(400);
    return { ok: true, quoteId };
  },

  async bookAppointment(_dealerId: string, _dateLabel: string, _time: string) {
    await delay(600);
    return { ok: true, reminder: '1 day before' };
  },
};
