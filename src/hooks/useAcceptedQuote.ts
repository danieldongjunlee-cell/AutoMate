import { AcceptedQuote, acceptedQuotesInEstimateRange } from '../services/mock/data';
import { useAppStore } from '../store/useAppStore';

/** Accepted quotes with prices remapped into the current AI estimate range. */
export function useAcceptedQuotes(): AcceptedQuote[] {
  const aiEstimate = useAppStore((s) => s.aiEstimate);
  return acceptedQuotesInEstimateRange(aiEstimate);
}

/** A single accepted quote (estimate-adjusted), by id; falls back to the first. */
export function useAcceptedQuote(id: string | null | undefined): AcceptedQuote {
  const list = useAcceptedQuotes();
  return list.find((q) => q.id === id) ?? list[0];
}
