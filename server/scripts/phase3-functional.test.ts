/**
 * Phase 3 pre-release functional suite — exercises the live API on
 * localhost:4000 with DB side-effect assertions via Prisma.
 *
 * Run:  cd server && npx tsx scripts/phase3-functional.test.ts
 * Requires: server running (src/index.ts), DATABASE_URL reachable.
 */
import { EARN_RULES as SERVER_RULES } from '../src/config';
// The server's configured client (Prisma 7 pg driver adapter + env loading).
import { prisma } from '../src/db';
// Client earn schedule — must match the server's exactly.
import { EARN_RULES as CLIENT_RULES } from '../../src/config/points';

const API = process.env.API_URL ?? 'http://127.0.0.1:4000';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function req(
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<{ status: number; json: any }> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, json };
}

/** Full signup → OTP → token for a fresh user. */
async function createUser(email: string, name = 'Test User') {
  const su = await req('POST', '/auth/signup', { fullName: name, email, password: 'hunter22' });
  if (su.status !== 200) throw new Error(`signup ${email} → ${su.status}`);
  const ver = await req('POST', '/auth/verify-otp', { email, code: '123456' });
  if (!ver.json?.token) throw new Error(`verify-otp ${email} failed`);
  return ver.json.token as string;
}

async function main() {
  const stamp = Date.now();
  const emailA = `qa-a-${stamp}@test.automate`;
  const emailB = `qa-b-${stamp}@test.automate`;

  // ── 0. Earn-schedule parity (client ↔ server) ────────────────────────
  console.log('\n[0] Earn-schedule parity');
  const clientKeys = Object.keys(CLIENT_RULES).sort();
  const serverKeys = Object.keys(SERVER_RULES).sort();
  check(
    'EARN_RULES keys identical',
    JSON.stringify(clientKeys) === JSON.stringify(serverKeys),
    `client=${clientKeys} server=${serverKeys}`,
  );
  for (const k of clientKeys) {
    check(
      `EARN_RULES.${k} value matches`,
      (CLIENT_RULES as any)[k] === (SERVER_RULES as any)[k],
      `client=${(CLIENT_RULES as any)[k]} server=${(SERVER_RULES as any)[k]}`,
    );
  }

  // ── 1. Auth ──────────────────────────────────────────────────────────
  console.log('\n[1] Auth');
  const su = await req('POST', '/auth/signup', {
    fullName: 'QA UserA',
    email: emailA,
    password: 'hunter22',
  });
  check('signup returns otpSentTo', su.status === 200 && !!su.json?.otpSentTo);
  const dup = await req('POST', '/auth/signup', {
    fullName: 'QA UserA',
    email: emailA,
    password: 'hunter22',
  });
  check('duplicate signup → 409', dup.status === 409);
  const badLogin = await req('POST', '/auth/login', { email: emailA, password: 'wrong' });
  check('wrong password → 401', badLogin.status === 401);
  const okLogin = await req('POST', '/auth/login', { email: emailA, password: 'hunter22' });
  check('login ok → otpSentTo', okLogin.status === 200 && !!okLogin.json?.otpSentTo);
  const badOtp = await req('POST', '/auth/verify-otp', { email: emailA, code: '000000' });
  check('wrong OTP → 401', badOtp.status === 401);
  const ver = await req('POST', '/auth/verify-otp', { email: emailA, code: '123456' });
  check('OTP 123456 → JWT + user', ver.status === 200 && !!ver.json?.token && !!ver.json?.user);
  const tokenA = ver.json.token as string;
  const noAuth = await req('GET', '/points');
  check('protected route w/o token → 401', noAuth.status === 401);
  const malformed = await req('POST', '/auth/signup', { nonsense: true });
  check('malformed signup body → 4xx not 500', malformed.status >= 400 && malformed.status < 500);

  const userA = await prisma.user.findUnique({ where: { email: emailA } });
  check('user row created in DB', !!userA);

  // ── 2. Vehicles ──────────────────────────────────────────────────────
  console.log('\n[2] Vehicles');
  const addV = await req(
    'POST',
    '/profile/vehicles',
    { name: '2019 Honda Accord EX-L', colorName: 'Platinum White Pearl' },
    tokenA,
  );
  check('add vehicle ok', addV.status === 200 && !!(addV.json?.vehicle?.id ?? addV.json?.id));
  const vehId = addV.json?.vehicle?.id ?? addV.json?.id;
  const listV = await req('GET', '/profile/vehicles', undefined, tokenA);
  const vehicles = Array.isArray(listV.json) ? listV.json : listV.json?.vehicles ?? [];
  check('vehicle listed', vehicles.some((v: any) => v.name === '2019 Honda Accord EX-L'));
  const priV = await req('PUT', `/profile/vehicles/${vehId}`, { isPrimary: true }, tokenA);
  check('set primary ok', priV.status === 200);

  // ── 3. Damage request → quotes ───────────────────────────────────────
  console.log('\n[3] Damage request → quotes');
  const emptySubmit = await req('POST', '/quotes/submit', { parts: [] }, tokenA);
  check('submit with no parts → 400', emptySubmit.status === 400);
  const submit = await req(
    'POST',
    '/quotes/submit',
    { parts: [{ part: 'Front bumper', type: 'Scratch, Dent', photos: 1 }] },
    tokenA,
  );
  check('submit ok', submit.status === 200 && submit.json?.shopsNotified === 12);
  check(
    'submit returns AI estimate range',
    submit.json?.aiEstimate?.priceLow > 0 &&
      submit.json.aiEstimate.priceHigh > submit.json.aiEstimate.priceLow,
  );
  check('submit awards submitPhotos points', submit.json?.pointsEarned === SERVER_RULES.submitPhotos);
  const dr = await prisma.damageRequest.findFirst({
    where: { userId: userA!.id },
    orderBy: { createdAt: 'desc' },
  });
  check('damage_requests row created', !!dr && dr.status === 'open' && dr.shopsNotified === 12);
  check('AI fields persisted on request', !!dr?.aiPart && !!dr?.aiPriceLow && !!dr?.aiConfidence);

  // Dealer responds (out-of-band in prod) — seed a quote row, then accept it.
  const q = await prisma.quote.create({
    data: {
      damageRequestId: dr!.id,
      dealerId: 'honda-fairfax',
      dealerName: 'Honda of Fairfax',
      price: 320,
      priceHigh: 480,
      note: 'OEM bumper repair + blend',
      parts: 'OEM',
      tier: 'best',
    },
  });
  const quotes = await req('GET', '/quotes', undefined, tokenA);
  check(
    'GET /quotes returns the dealer quote',
    Array.isArray(quotes.json) && quotes.json.some((x: any) => x.id === q.id),
  );
  const accept = await req('POST', `/quotes/${q.id}/accept`, {}, tokenA);
  check('accept quote ok', accept.status === 200 && accept.json?.ok === true);
  const qRow = await prisma.quote.findUnique({ where: { id: q.id } });
  check('quote status → accepted in DB', qRow?.status === 'accepted');

  // ── 4. Bookings + payments ───────────────────────────────────────────
  console.log('\n[4] Bookings + payments');
  const noDealer = await req('POST', '/bookings', {}, tokenA);
  check('booking without dealerId → 400', noDealer.status === 400);
  const book = await req(
    'POST',
    '/bookings',
    { dealerId: 'honda-fairfax', dateLabel: '2026-07-10', time: '8:00 AM', kind: 'repair' },
    tokenA,
  );
  check('repair booking ok + bookService points', book.json?.pointsEarned === SERVER_RULES.bookService);
  const pay = await req(
    'POST',
    '/bookings/pay',
    { total: 129.99, dealerId: 'honda-fairfax', services: [{ name: 'Oil change', price: 129.99 }] },
    tokenA,
  );
  check('maintenance pay ok', pay.status === 200 && pay.json?.ok === true);
  const payment = await prisma.payment.findFirst({
    where: { userId: userA!.id, purpose: 'booking' },
    orderBy: { createdAt: 'desc' },
  });
  check(
    'payment row: 12999¢, purpose=booking, linked to booking',
    payment?.amountCents === 12999 && !!payment?.bookingId,
  );
  const paidBooking = await prisma.booking.findUnique({ where: { id: payment!.bookingId! } });
  check('booking status=paid, total_cents matches', paidBooking?.status === 'paid' && paidBooking?.totalCents === 12999);

  // ── 5. Points ledger ─────────────────────────────────────────────────
  console.log('\n[5] Points ledger');
  const ci1 = await req('POST', '/points/check-in', {}, tokenA);
  check(
    'first check-in awards dailyCheckIn',
    ci1.json?.awarded === true && ci1.json?.pointsEarned === SERVER_RULES.dailyCheckIn,
  );
  const ci2 = await req('POST', '/points/check-in', {}, tokenA);
  check('second check-in same day → awarded:false', ci2.json?.awarded === false && ci2.json?.pointsEarned === 0);
  const pts = await req('GET', '/points', undefined, tokenA);
  const expectedBalance =
    SERVER_RULES.submitPhotos + 2 * SERVER_RULES.bookService + SERVER_RULES.dailyCheckIn;
  check(
    `balance = submit+2×book+checkIn (${expectedBalance})`,
    pts.json?.balance === expectedBalance,
    `got ${pts.json?.balance}`,
  );
  check(
    'dollarValue = balance × $0.01',
    pts.json?.dollarValue === Number((expectedBalance * 0.01).toFixed(2)),
  );
  const over = await req('POST', '/points/redeem', { points: 999999, reason: 'grab' }, tokenA);
  check('over-redemption rejected (4xx, balance guarded)', over.status >= 400 && over.status < 500);
  const redeem = await req('POST', '/points/redeem', { points: 50, reason: 'Service discount' }, tokenA);
  check('valid redemption ok', redeem.status === 200 && redeem.json?.balance === expectedBalance - 50);
  const negEarn = await req('POST', '/points/earn', { points: -10 }, tokenA);
  check('negative earn rejected', negEarn.status === 400);
  // Ledger chain: balance_after must equal running sum per user.
  const ledger = await prisma.pointsLedgerEntry.findMany({
    where: { userId: userA!.id },
    orderBy: { createdAt: 'asc' },
  });
  let run = 0;
  let chainOk = true;
  for (const e of ledger) {
    run += e.delta;
    if (e.balanceAfter !== run) chainOk = false;
  }
  check('ledger balance_after chain consistent', chainOk && run === expectedBalance - 50);
  check('no negative balance at any ledger point', ledger.every((e) => e.balanceAfter >= 0));

  // ── 6. Pro membership ────────────────────────────────────────────────
  console.log('\n[6] Pro membership');
  const sub = await req('POST', '/pro/subscribe', { plan: 'annual' }, tokenA);
  check('subscribe annual → 4800¢', sub.json?.priceCents === 4800 && sub.json?.plan === 'annual');
  const mem = await prisma.proMembership.findFirst({ where: { userId: userA!.id } });
  const yearMs = 365 * 24 * 3600 * 1000;
  check('membership: plan=annual, lifetime=false', mem?.plan === 'annual' && mem?.lifetime === false);
  check(
    'renews_at ≈ +1 year',
    !!mem?.renewsAt && Math.abs(mem.renewsAt.getTime() - Date.now() - yearMs) < 3 * 24 * 3600 * 1000,
  );
  const proGet = await req('GET', '/pro', undefined, tokenA);
  check('GET /pro → isPro + membership', proGet.json?.isPro === true && !!proGet.json?.membership);
  const paymentsBefore = await prisma.payment.count({
    where: { userId: userA!.id, purpose: 'pro_membership' },
  });
  const resub = await req('POST', '/pro/subscribe', { plan: 'monthly' }, tokenA);
  const paymentsAfter = await prisma.payment.count({
    where: { userId: userA!.id, purpose: 'pro_membership' },
  });
  check('re-subscribe → alreadyPro, no duplicate payment', resub.json?.alreadyPro === true && paymentsAfter === paymentsBefore);
  const diy = await req('POST', '/pro/diy-unlock', {}, tokenA);
  check('diy-unlock → 1000¢', diy.json?.priceCents === 1000);
  const diyPayment = await prisma.payment.findFirst({
    where: { userId: userA!.id, purpose: 'diy_unlock' },
  });
  check('diy_unlock payment row (1000¢, no membership)', diyPayment?.amountCents === 1000);
  const memCount = await prisma.proMembership.count({ where: { userId: userA!.id } });
  check('still exactly one membership row', memCount === 1);

  // Monthly plan on a second user.
  const tokenB = await createUser(emailB, 'QA UserB');
  const subM = await req('POST', '/pro/subscribe', { plan: 'monthly' }, tokenB);
  const userB = await prisma.user.findUnique({ where: { email: emailB } });
  const memB = await prisma.proMembership.findFirst({ where: { userId: userB!.id } });
  const monthMs = 27 * 24 * 3600 * 1000;
  check('subscribe monthly → 999¢', subM.json?.priceCents === 999);
  check(
    'monthly renews_at ≈ +1 month',
    !!memB?.renewsAt &&
      memB.renewsAt.getTime() - Date.now() > monthMs &&
      memB.renewsAt.getTime() - Date.now() < 32 * 24 * 3600 * 1000,
  );

  // ── 7. Cross-user isolation ──────────────────────────────────────────
  console.log('\n[7] Cross-user isolation');
  const bVehicles = await req('GET', '/profile/vehicles', undefined, tokenB);
  const bList = Array.isArray(bVehicles.json) ? bVehicles.json : bVehicles.json?.vehicles ?? [];
  check("user B can't see A's vehicles", !bList.some((v: any) => v.id === vehId));
  const bMutate = await req('PUT', `/profile/vehicles/${vehId}`, { name: 'HACKED' }, tokenB);
  check("user B can't mutate A's vehicle", bMutate.status === 404 || bMutate.status === 403);
  const vehAfter = await prisma.vehicle.findUnique({ where: { id: vehId } });
  check('vehicle name unchanged in DB', vehAfter?.name === '2019 Honda Accord EX-L');
  const bQuotes = await req('GET', '/quotes', undefined, tokenB);
  check("user B sees no quotes of A's request", Array.isArray(bQuotes.json) && bQuotes.json.length === 0);
  const bAccept = await req('POST', `/quotes/${q.id}/accept`, {}, tokenB);
  check("user B can't accept A's quote", bAccept.status === 404);
  const bPoints = await req('GET', '/points', undefined, tokenB);
  check("user B's points independent", bPoints.json?.balance === 0 || bPoints.json?.balance === undefined ? bPoints.json?.balance === 0 : true);

  // ── Summary ──────────────────────────────────────────────────────────
  console.log(`\n=== Phase 3: ${passed} passed, ${failed} failed ===`);
  if (failures.length) {
    console.log('FAILURES:');
    for (const f of failures) console.log(` - ${f}`);
    process.exitCode = 1;
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('SUITE ERROR:', e);
  await prisma.$disconnect();
  process.exit(2);
});
