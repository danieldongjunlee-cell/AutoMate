/**
 * Pure insurance-vs-cash premium-impact model (phase 5).
 *
 * Transparent coefficient model: claim type + claim-amount band → percent
 * premium surcharge per year for a fixed number of years (config/). A
 * regression model can later replace `predictPremiumImpact` behind the same
 * signature.
 *
 * IMPORTANT: this module is intentionally duplicated in two packages —
 *   server/src/actuarial/    (Express route /compare/estimate)
 *   src/services/actuarial/  (mock compareService twin in the app)
 * Keep both copies byte-identical; scripts/actuarial-parity.ts (run with
 * server/node_modules/.bin/tsx) fails the gate if they drift.
 */
import {
  ACTUARIAL_VIRGINIA,
  ActuarialConfig,
  ClaimType,
  SurchargeBand,
} from './config/actuarial.virginia';

export type { ClaimType };

export interface PremiumImpactInput {
  claimType: ClaimType;
  /** Estimated repair / claim cost, whole USD. */
  claimAmount: number;
  /** Annual premium, whole USD. */
  premiumPerYear: number;
  /** Policy deductible, whole USD. */
  deductible: number;
  /** Only VA coefficients exist today; any other state falls back to VA. */
  state?: string;
}

export interface PremiumImpactResult {
  surchargePctPerYear: number;
  surchargeYears: number;
  /** Extra premium paid over the whole surcharge window (USD). */
  totalSurcharge: number;
  /** Insurance path over 3 years: deductible + total surcharge. */
  insuranceTotal3yr: number;
  /** Cash path over 3 years: the repair cost, paid once. */
  cashTotal3yr: number;
  /**
   * First month the cumulative insurance-path cost exceeds the cash path
   * (1 when the deductible alone ≥ the repair cost); null when the
   * insurance path never exceeds cash within the surcharge window.
   */
  breakEvenMonth: number | null;
  recommendation: 'cash' | 'insurance';
  /** Human-readable model assumptions for the disclosure UI. */
  assumptions: string[];
}

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

const bandFor = (bands: SurchargeBand[], amount: number): SurchargeBand =>
  bands.find((b) => b.maxAmount === null || amount < b.maxAmount) ?? bands[bands.length - 1];

/** VA-only today — single place to add more state configs later. */
const configFor = (_state?: string): ActuarialConfig => ACTUARIAL_VIRGINIA;

export function predictPremiumImpact(input: PremiumImpactInput): PremiumImpactResult {
  const config = configFor(input.state);
  const band = bandFor(config.bands[input.claimType], input.claimAmount);
  const surchargeYears = config.surchargeYears;
  const surchargePerYear = (input.premiumPerYear * band.pctPerYear) / 100;
  const totalSurcharge = Math.round(surchargePerYear * surchargeYears);
  const insuranceTotal3yr = Math.round(input.deductible + totalSurcharge);
  const cashTotal3yr = Math.round(input.claimAmount);

  // Break-even: the deductible is due up-front (month 1); the surcharge then
  // accrues monthly across the surcharge window.
  let breakEvenMonth: number | null = null;
  if (input.deductible >= cashTotal3yr) {
    breakEvenMonth = 1;
  } else {
    const monthlySurcharge = surchargePerYear / 12;
    for (let month = 1; month <= surchargeYears * 12; month++) {
      if (input.deductible + monthlySurcharge * month > cashTotal3yr) {
        breakEvenMonth = month;
        break;
      }
    }
  }

  const recommendation: 'cash' | 'insurance' =
    cashTotal3yr <= insuranceTotal3yr ? 'cash' : 'insurance';

  const assumptions = [
    `~${band.pctPerYear}%/yr premium surcharge for ${surchargeYears} years — ${config.state} ${input.claimType} claims ${band.label}`,
    `Surcharge applied to your ${usd(input.premiumPerYear)}/yr premium (+${usd(surchargePerYear)}/yr, +${usd(totalSurcharge)} total)`,
    `Full ${usd(input.deductible)} deductible counted on the insurance path`,
    `Claim stays on record for ${surchargeYears} years; assumes no accident forgiveness and no lost claim-free discounts`,
    'Coefficients are estimates from industry premium-surcharge studies — not a quote from your insurer',
  ];

  return {
    surchargePctPerYear: band.pctPerYear,
    surchargeYears,
    totalSurcharge,
    insuranceTotal3yr,
    cashTotal3yr,
    breakEvenMonth,
    recommendation,
    assumptions,
  };
}
