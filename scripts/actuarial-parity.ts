/**
 * Parity gate for the duplicated actuarial module (phase 5).
 *
 * The pure premium-impact model exists twice (separate packages, no shared
 * workspace): server/src/actuarial/ and src/services/actuarial/. This script
 * proves both copies are interchangeable by (1) comparing their coefficient
 * configs and (2) running both predictors over an input grid and deep-
 * comparing every result — including the exact wireframe case.
 *
 * Run: cd server && npm run test:parity
 *   (or server/node_modules/.bin/tsx scripts/actuarial-parity.ts from root)
 */
import {
  predictPremiumImpact as appPredict,
  ClaimType as AppClaimType,
} from '../src/services/actuarial/predict';
import { ACTUARIAL_VIRGINIA as APP_CONFIG } from '../src/services/actuarial/config/actuarial.virginia';
import { predictPremiumImpact as serverPredict } from '../server/src/actuarial/predict';
import { ACTUARIAL_VIRGINIA as SERVER_CONFIG } from '../server/src/actuarial/config/actuarial.virginia';

// No node:assert — this file is typechecked by the root (Expo) tsconfig,
// which has no Node type definitions. JSON comparison is exact here because
// both module copies are byte-identical, so key order matches.
const assertSame = (actual: unknown, expected: unknown, message: string) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message}\n  actual:   ${a}\n  expected: ${e}`);
  }
};

// 1. Identical coefficients.
assertSame(APP_CONFIG, SERVER_CONFIG, 'actuarial configs drifted between app and server');
console.log('  ✓ configs identical (state, surcharge years, all bands)');

// 2. Identical predictions across a grid spanning every band and edge.
const claimTypes: AppClaimType[] = ['collision', 'comprehensive'];
const claimAmounts = [0, 50, 320, 800, 999, 1000, 2500, 4999, 5000, 7500, 12000];
const deductibles = [0, 250, 500, 1000, 2000];
const premiums = [600, 1200, 2400];

let cases = 0;
for (const claimType of claimTypes) {
  for (const claimAmount of claimAmounts) {
    for (const deductible of deductibles) {
      for (const premiumPerYear of premiums) {
        const input = { claimType, claimAmount, deductible, premiumPerYear, state: 'VA' };
        assertSame(
          appPredict(input),
          serverPredict(input),
          `prediction drift for ${JSON.stringify(input)}`,
        );
        cases += 1;
      }
    }
  }
}
console.log(`  ✓ ${cases} grid cases produce identical results`);

// 3. Both copies reproduce the wireframe deep-dive numbers.
const wf = appPredict({
  claimType: 'collision',
  claimAmount: 320,
  premiumPerYear: 1200,
  deductible: 500,
  state: 'VA',
});
assertSame(wf.cashTotal3yr, 320, 'wireframe cash 3-yr total');
assertSame(wf.insuranceTotal3yr, 1040, 'wireframe insurance 3-yr total');
assertSame(wf.totalSurcharge, 540, 'wireframe total surcharge');
assertSame(wf.surchargePctPerYear, 15, 'wireframe surcharge pct/yr');
assertSame(wf.breakEvenMonth, 1, 'wireframe break-even month');
assertSame(wf.recommendation, 'cash', 'wireframe recommendation');
console.log('  ✓ wireframe case: $320 cash vs $1,040 insurance, break-even month 1, cash');

console.log('actuarial parity: PASS');
