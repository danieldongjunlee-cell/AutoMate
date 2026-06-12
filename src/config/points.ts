/**
 * Points economy — single source of truth (client).
 *
 * APPROVED DECISION: 1 point = $0.01, the wireframe's rate (420 pts = $4.20,
 * 100 pts = $1). The gap-analysis spec's $0.10 figure was overruled.
 *
 * server/src/config.ts mirrors POINT_VALUE_USD + EARN_RULES — keep in sync.
 */
export const POINT_VALUE_USD = 0.01;

/** Points needed per redeemed dollar (100 pts = $1). */
export const POINTS_PER_USD = Math.round(1 / POINT_VALUE_USD);

/** Format a points amount as its dollar value: 420 → "$4.20". */
export function pointsToUsd(points: number): string {
  return `$${(points * POINT_VALUE_USD).toFixed(2)}`;
}

/** Earn schedule (wireframe s-prof-earn "Earn points" list). */
export const EARN_RULES = {
  /** Daily check-in — once per calendar day, awarded on Home mount. */
  dailyCheckIn: 10,
  /** Per-day streak bonus shown on the Home streak banner. */
  streakDayBonus: 10,
  /** Scan service receipt → history. */
  scanReceipt: 20,
  /** Manual service log → history. */
  manualLog: 10,
  /** Book service via app. */
  bookService: 50,
  /** Submit damage photos for quotes. */
  submitPhotos: 20,
  /** Post in community. */
  communityPost: 50,
  /** Bonus when a community post includes photos. */
  communityPhotoBonus: 10,
  /** Add insurance policy. */
  addInsurance: 100,
  /** Refer a friend. */
  referFriend: 100,
} as const;

export type EarnRule = keyof typeof EARN_RULES;

/** Human-readable ledger reasons per rule (mirrors the server's reasons). */
export const EARN_REASONS: Record<EarnRule, string> = {
  dailyCheckIn: 'Daily check-in',
  streakDayBonus: 'Streak day bonus',
  scanReceipt: 'Scan service receipt',
  manualLog: 'Manual service log',
  bookService: 'Book service via app',
  submitPhotos: 'Submit damage photos',
  communityPost: 'Post in community',
  communityPhotoBonus: 'Community photo bonus',
  addInsurance: 'Add insurance policy',
  referFriend: 'Refer a friend',
};
