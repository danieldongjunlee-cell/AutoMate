/**
 * Virginia premium-surcharge coefficients (phase 5 actuarial model).
 *
 * Data SHAPE mirrors published industry premium-surcharge structures:
 *  - ISO-style Safe Driver Insurance Plan (SDIP) surcharge schedules, where
 *    an at-fault claim adds rating points by claim size for a fixed number
 *    of policy years (typically 3).
 *  - Bankrate / Quadrant Information Services post-claim premium analyses
 *    (2024): a single at-fault collision claim raises a US full-coverage
 *    premium roughly 12–45%/yr depending on claim size; comprehensive
 *    claims (glass, theft, weather) move premiums far less (~0–10%/yr).
 *  - NAIC Auto Insurance Database reports for state-level premium baselines.
 *
 * ⚠ All percentages below are ESTIMATES tuned for the AutoMate demo — they
 * are NOT filed rates and NOT a quote from any insurer. The <$1k collision
 * band is pinned at 15%/yr × 3yr so the wireframe example ($320 repair,
 * $500 deductible, $1,200/yr premium → +$540 surcharge, $1,040 insurance
 * 3-yr total vs $320 cash) reproduces exactly on s-comp-deep-dive.
 *
 * IMPORTANT: this file is duplicated byte-for-byte in two packages —
 *   server/src/actuarial/config/   and   src/services/actuarial/config/
 * Keep both copies identical; scripts/actuarial-parity.ts enforces it.
 */

export type ClaimType = 'collision' | 'comprehensive';

export interface SurchargeBand {
  /** Upper bound (exclusive) of the claim amount for this band; null = no cap. */
  maxAmount: number | null;
  /** Premium surcharge, percent per year, while the claim stays on record. */
  pctPerYear: number;
  /** Human label used in assumptions copy ("under $1,000", …). */
  label: string;
}

export interface ActuarialConfig {
  state: string;
  /** Years an at-fault claim stays surcharged on the policy (VA: 3). */
  surchargeYears: number;
  bands: Record<ClaimType, SurchargeBand[]>;
}

export const ACTUARIAL_VIRGINIA: ActuarialConfig = {
  state: 'VA',
  surchargeYears: 3,
  bands: {
    collision: [
      { maxAmount: 1000, pctPerYear: 15, label: 'under $1,000' },
      { maxAmount: 5000, pctPerYear: 24, label: '$1,000–$5,000' },
      { maxAmount: null, pctPerYear: 32, label: 'over $5,000' },
    ],
    comprehensive: [
      { maxAmount: 1000, pctPerYear: 3, label: 'under $1,000' },
      { maxAmount: 5000, pctPerYear: 6, label: '$1,000–$5,000' },
      { maxAmount: null, pctPerYear: 9, label: 'over $5,000' },
    ],
  },
};
