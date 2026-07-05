/**
 * Phase 4 E2E suite — mock-mode web build on :8081.
 * Covers: guest estimate + locked preview, guest→new-user carryover,
 * duplicate + replace prompts, returning-user replace prompt, daily check-in,
 * Pro renews date, deep-link/refresh/console smoke.
 */
const { chromium } = require('playwright-core');
const path = require('path');

const APP = 'http://127.0.0.1:8081';
const SAMPLE = '/home/user/AutoMate/test-assets/damage-samples/front-bumper-scratch-dent.jpg';

let passed = 0, failed = 0;
const failures = [];
const consoleErrors = [];

function ok(name, cond, detail) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; failures.push(name + (detail ? ` — ${detail}` : '')); console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
}

async function shot(page, name) {
  try { await page.screenshot({ path: `shots/${name}.png` }); } catch {}
}

/** Click the first (or last, for modal options) VISIBLE match of `text`. */
async function tap(page, text, opts = {}) {
  const deadline = Date.now() + (opts.timeout ?? 8000);
  const matches = page.getByText(text, { exact: opts.exact ?? false });
  for (;;) {
    const n = await matches.count();
    const idxs = [...Array(n).keys()];
    if (opts.last) idxs.reverse();
    for (const i of idxs) {
      const el = matches.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 3000 });
        return;
      }
    }
    if (Date.now() > deadline) throw new Error(`tap timeout: no visible "${text}"`);
    await page.waitForTimeout(200);
  }
}

async function visible(page, text, timeout = 8000, exact = false) {
  const deadline = Date.now() + timeout;
  const matches = page.getByText(text, { exact });
  for (;;) {
    const n = await matches.count().catch(() => 0);
    for (let i = 0; i < n; i++) {
      if (await matches.nth(i).isVisible().catch(() => false)) return true;
    }
    if (Date.now() > deadline) return false;
    await page.waitForTimeout(200);
  }
}

async function newPage(browser, label) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  currentPage = page;
  page.on('console', (m) => {
    if (m.type() === 'error' && !/ERR_TUNNEL|net::|favicon/.test(m.text()))
      consoleErrors.push(`[${label}] ${m.text().slice(0, 160)}`);
  });
  page.on('pageerror', (e) => consoleErrors.push(`[${label}] pageerror: ${String(e).slice(0, 160)}`));
  return { ctx, page };
}

async function dismissLocation(page) {
  try { await page.getByText('Don’t allow').first().click({ timeout: 4000 }); } catch {}
}

/** Guest damage flow: pick part(s), types, photo, save → intake (optionally) → confirm. */
async function addPart(page, partLabel, types) {
  await tap(page, partLabel, { exact: true });
  for (const t of types) await tap(page, t, { exact: true });
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 8000 }),
    tap(page, '📷＋'),
  ]);
  await chooser.setFiles(SAMPLE);
  await page.waitForTimeout(600);
  await tap(page, 'Save →');
}

async function fillIntake(page) {
  await tap(page, 'Select brand');
  await tap(page, 'Honda', { exact: true, last: true });
  await tap(page, 'Select a Honda model');
  await tap(page, 'Accord', { exact: true, last: true });
  await tap(page, 'Year', { exact: true, last: true }); // placeholder "Year"
  await tap(page, '2019', { exact: true, last: true });
  await tap(page, 'Color', { exact: true, last: true });
  await tap(page, 'White', { exact: true, last: true });
  // Location: progressive section appears after car is done.
  const locInput = page.getByPlaceholder('City, county or ZIP — e.g. Fairfax, VA');
  await locInput.waitFor({ state: 'visible', timeout: 8000 });
  await locInput.fill('Fairfax');
  await page.waitForTimeout(400);
  await tap(page, 'Fairfax, VA', { exact: true, last: true });
  await tap(page, 'Yes', { exact: true }); // insurance
  await tap(page, 'Continue →');
}

async function signUpNewUser(page, email) {
  await tap(page, 'New user');
  await page.getByPlaceholder('John Doe').fill('E2E Tester');
  await page.getByPlaceholder('johndoe@email.com').fill(email);
  await page.getByPlaceholder('+1 (703) 555-0198').fill('+1 (703) 555-0142');
  await page.getByPlaceholder('••••••••').first().fill('Passw0rd42');
  await page.getByPlaceholder('••••••••').nth(1).fill('Passw0rd42');
  await tap(page, 'Create account', { exact: true, last: true }); // button, not the title
  await visible(page, 'Where should we send', 10000);
  await tap(page, 'Email', { exact: true, last: true }); // VerifyMethod card
  await enterOtp(page);
}

async function enterOtp(page) {
  await visible(page, 'Enter the 6-digit code', 10000);
  // The 6 cells are backed by one (visually hidden) autofocused TextInput —
  // click the cell row to focus it, then type on the keyboard.
  await page.getByText('Enter the 6-digit code').first().click().catch(() => {});
  const inputs = page.locator('input');
  const n = await inputs.count();
  for (let i = 0; i < n; i++) {
    const ml = await inputs.nth(i).getAttribute('maxlength');
    if (ml === '6') { await inputs.nth(i).focus(); break; }
  }
  await page.keyboard.type('123456', { delay: 40 });
  await tap(page, 'Verify →');
}

let currentPage = null;
async function dumpState(tag) {
  if (!currentPage) return;
  try {
    await currentPage.screenshot({ path: `shots/error-${tag}.png` });
    const texts = await currentPage.evaluate(() =>
      Array.from(document.querySelectorAll('div,span'))
        .filter((e) => e.checkVisibility && e.checkVisibility())
        .map((e) => (e.childNodes.length === 1 && e.childNodes[0].nodeType === 3 ? e.textContent.trim() : ''))
        .filter((t) => t && t.length < 50)
        .slice(0, 60),
    );
    console.log('VISIBLE:', JSON.stringify(texts));
  } catch {}
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  require('fs').mkdirSync('shots', { recursive: true });

  // ── Context A: guest estimate → new-user signup → duplicate/replace ──
  console.log('\n[E2E-1] Guest estimate + locked preview');
  const A = await newPage(browser, 'A');
  let page = A.page;
  await page.goto(APP, { waitUntil: 'networkidle' });
  await dismissLocation(page);
  ok('guest banner shown', await visible(page, "You're browsing as a guest"));
  await tap(page, 'AI Repair Estimate');
  ok('car diagram shown', await visible(page, 'Where is it damaged?'));
  await addPart(page, 'Front bumper', ['Dent', 'Scratch']);
  ok('intake shown for guest', await visible(page, 'Brand'));
  await fillIntake(page);
  ok('confirm screen shows part', await visible(page, 'Parts selected', 15000));
  await shot(page, '1-confirm');
  await tap(page, 'Submit for quotes →');
  ok('AI range shown to guest', await visible(page, 'AI estimated repair cost', 15000));
  ok('quotes locked for guest', await visible(page, 'Sign up or log in to view these quotes'));
  await shot(page, '1-locked-preview');

  console.log('\n[E2E-2] Guest → new user: submission carries into the account');
  await tap(page, 'Sign up or log in to view quotes →');
  await signUpNewUser(page, `e2e-${Date.now()}@test.automate`);
  const submitted = await visible(page, 'View available quotes', 20000);
  ok('no replace prompt for new user; lands on Submitted', submitted);
  await shot(page, '2-submitted');
  if (submitted) await tap(page, 'View available quotes');
  ok('quotes visible after signup (not locked)', await visible(page, 'Best price', 12000));
  ok('estimate carried (range visible)', await visible(page, 'AI estimated repair cost'));
  await shot(page, '2-quotes');
  // The Quotes TAB must also show the carried-over submission (not the empty state).
  await tap(page, 'Quotes', { exact: true, last: true });
  await page.waitForTimeout(1200);
  const emptyState = await visible(page, 'No active quote', 3000);
  ok('Quotes tab shows the submission after signup (no empty state)', !emptyState);
  await shot(page, '2-quotes-tab');

  console.log('\n[E2E-3] Duplicate + replace prompts (authenticated resubmit)');
  // Home tab → AI Repair Estimate → same parts still staged → submit again.
  await tap(page, 'Home', { exact: true });
  await tap(page, 'AI Repair Estimate');
  // Same part already committed: go straight to review via Save-less path —
  // CarDiagram keeps damageParts; use the "ConfirmSubmit" route by re-saving the same part.
  await tap(page, '✓ Front bumper', { exact: true }); // edit committed part — draft inherits types+photos
  await tap(page, 'Save →');
  ok('back on confirm screen', await visible(page, 'Submit for quotes →'));
  await tap(page, 'Submit for quotes →');
  const dup = await visible(page, 'Same as your previous request', 15000);
  ok('duplicate prompt shown for identical resubmit', dup);
  ok('duplicate prompt carries removal warning', await visible(page, 'removes your previous quotes'));
  await shot(page, '3-duplicate');
  await tap(page, 'Back to my parts');
  // Change the submission (add Hood) → replace variant.
  await tap(page, 'Add another damaged part');
  await addPart(page, 'Hood', ['Dent']);
  await tap(page, 'Submit for quotes →');
  const rep = await visible(page, 'You already have an open quote request', 15000);
  ok('replace prompt when submission differs', rep);
  await shot(page, '3-replace');
  if (rep) {
    await tap(page, 'Keep my existing quotes');
    ok('keep-existing routes to Quotes tab', await visible(page, 'Shops near you', 10000));
  }

  console.log('\n[E2E-6] Daily check-in (once per day)');
  await tap(page, 'Home', { exact: true });
  const hadClaim = await visible(page, 'Claim', 4000);
  if (hadClaim) {
    await tap(page, 'Claim');
    await page.waitForTimeout(800);
  }
  ok('check-in claim consumed (button gone)', !(await visible(page, 'Claim', 2500, true)));

  console.log('\n[E2E-7] Pro subscribe → real renewal date');
  await tap(page, 'More', { exact: true });
  const goPro = await visible(page, 'Go Pro — skip deposits + DIY guides', 6000);
  ok('Go Pro card on profile', goPro);
  if (goPro) {
    await tap(page, 'Get Pro');
    await tap(page, 'Start Pro —');
    await page.waitForTimeout(2500);
    await shot(page, '7-pro-success');
    // Success screen → back to profile hub → Manage
    await tap(page, 'Back to More →', { exact: true, timeout: 10000 });
    await tap(page, 'Manage', { exact: true, last: true, timeout: 10000 });
    const renews2027 = await visible(page, '2027', 8000);
    ok('ProManage shows real renews date (+1yr → 2027)', renews2027);
    await shot(page, '7-pro-manage');
  }
  await A.ctx.close();

  // ── Context B: guest → RETURNING user replace prompt ─────────────────
  console.log('\n[E2E-4] Guest → returning user: replace warning');
  const B = await newPage(browser, 'B');
  page = B.page;
  await page.goto(APP, { waitUntil: 'networkidle' });
  await dismissLocation(page);
  await tap(page, 'AI Repair Estimate');
  await addPart(page, 'Trunk', ['Crack']);
  await fillIntake(page);
  await tap(page, 'Submit for quotes →');
  await visible(page, 'AI estimated repair cost', 15000);
  await tap(page, 'Sign up or log in to view quotes →');
  await tap(page, 'Returning user');
  await page.getByPlaceholder('johndoe@email.com').fill('demo@automate.app');
  await page.getByPlaceholder('••••••••').first().fill('Demo1234!');
  await tap(page, 'Sign in', { exact: true, last: true });
  await enterOtp(page);
  const repB = await visible(page, 'You already have an open quote request', 20000);
  ok('returning user sees replace prompt', repB);
  ok('warning: removes previous quotes + wait for shops',
     await visible(page, 'removes your previous quotes'));
  await shot(page, '4-returning-replace');
  if (repB) {
    await tap(page, 'Replace & submit new request →');
    ok('replace proceeds to Submitted', await visible(page, 'View available quotes', 20000));
  }
  await B.ctx.close();

  // ── Context C: robustness smoke ──────────────────────────────────────
  console.log('\n[E2E-9] Robustness smoke');
  const C = await newPage(browser, 'C');
  page = C.page;
  const deep = await page.goto(`${APP}/quotes`, { waitUntil: 'networkidle' });
  ok('deep link /quotes returns app (200)', deep.status() === 200);
  await dismissLocation(page);
  ok('deep link renders app UI', await visible(page, 'Home', 8000));
  await page.reload({ waitUntil: 'networkidle' });
  ok('refresh does not crash', await visible(page, 'Home', 8000));
  await C.ctx.close();

  ok('no unexpected console errors across contexts', consoleErrors.length === 0,
     consoleErrors.slice(0, 3).join(' | '));

  console.log(`\n=== Phase 4 E2E: ${passed} passed, ${failed} failed ===`);
  if (failures.length) { console.log('FAILURES:'); failures.forEach((f) => console.log(' - ' + f)); process.exitCode = 1; }
  await browser.close();
})().catch(async (e) => {
  console.error('E2E ERROR:', e.message);
  await dumpState('fatal');
  process.exit(1);
});
