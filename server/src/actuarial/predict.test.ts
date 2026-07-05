/**
 * Tiny assert-based test runner for the actuarial model.
 * Run: cd server && npm run test:actuarial   (tsx src/actuarial/predict.test.ts)
 */
import { strict as assert } from 'node:assert';

import { predictPremiumImpact } from './predict';

let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
};

// ── Wireframe case (s-comp-deep-dive) ───────────────────────────────────
// $320 repair, $500 ded., $1,200/yr premium → 15%/yr × 3yr = $540 surcharge,
// insurance 3-yr $1,040 vs cash $320, break-even month 1, verdict cash.
test('wireframe case: $320 collision, $500 ded, $1200/yr premium', () => {
  const r = predictPremiumImpact({
    claimType: 'collision',
    claimAmount: 320,
    premiumPerYear: 1200,
    deductible: 500,
    state: 'VA',
  });
  assert.equal(r.surchargePctPerYear, 15);
  assert.equal(r.surchargeYears, 3);
  assert.equal(r.totalSurcharge, 540);
  assert.equal(r.insuranceTotal3yr, 1040); // 500 deductible + 540 surcharge
  assert.equal(r.cashTotal3yr, 320);
  assert.equal(r.breakEvenMonth, 1); // deductible alone ≥ repair
  assert.equal(r.recommendation, 'cash');
  assert.ok(r.assumptions.some((a) => a.includes('15%/yr') && a.includes('under $1,000')));
  assert.ok(r.assumptions.some((a) => a.includes('not a quote')));
});

test('mid break-even: $800 collision, $500 ded → month 21', () => {
  const r = predictPremiumImpact({
    claimType: 'collision',
    claimAmount: 800,
    premiumPerYear: 1200,
    deductible: 500,
  });
  // 15%/yr → $15/mo surcharge; 500 + 15m > 800 → m = 21
  assert.equal(r.breakEvenMonth, 21);
  assert.equal(r.insuranceTotal3yr, 1040);
  assert.equal(r.recommendation, 'cash');
});

test('large claim: $2,500 collision favors insurance, never breaks even', () => {
  const r = predictPremiumImpact({
    claimType: 'collision',
    claimAmount: 2500,
    premiumPerYear: 1200,
    deductible: 500,
  });
  assert.equal(r.surchargePctPerYear, 24); // $1,000–$5,000 band
  assert.equal(r.totalSurcharge, 864);
  assert.equal(r.insuranceTotal3yr, 1364);
  assert.equal(r.breakEvenMonth, null); // 500 + $24/mo never exceeds 2500 in 36 mo
  assert.equal(r.recommendation, 'insurance');
});

test('comprehensive band uses the milder coefficients', () => {
  const r = predictPremiumImpact({
    claimType: 'comprehensive',
    claimAmount: 320,
    premiumPerYear: 1200,
    deductible: 500,
  });
  assert.equal(r.surchargePctPerYear, 3);
  assert.equal(r.totalSurcharge, 108);
  assert.equal(r.insuranceTotal3yr, 608);
  assert.equal(r.recommendation, 'cash');
});

test('top band: claims over $5,000', () => {
  const r = predictPremiumImpact({
    claimType: 'collision',
    claimAmount: 7500,
    premiumPerYear: 1200,
    deductible: 1000,
  });
  assert.equal(r.surchargePctPerYear, 32);
  assert.equal(r.totalSurcharge, 1152);
  assert.equal(r.insuranceTotal3yr, 2152);
  assert.equal(r.recommendation, 'insurance');
});

console.log(`actuarial predict: ${passed} tests passed`);
