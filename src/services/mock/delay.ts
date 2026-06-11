/** Simulated network latency for all mock services (single seam for tests). */
export const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
