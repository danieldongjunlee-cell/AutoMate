/**
 * Demo seed (wireframe v15.10):
 *   demo@automate.app / Demo1234! (OTP 123456) · 2019 Honda Accord EX-L ·
 *   State Farm SF-8847234 · 8 quotes · 2 bookings · history · 420 pts ·
 *   notifications + community posts.
 *
 * Run: npm run seed   (idempotent — wipes and recreates the demo user's data)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { makeAdapter } from '../src/prismaAdapter';

// Load server/.env if present (real env vars take precedence).
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the actual environment
}

// makeAdapter() reads DATABASE_URL, so it runs after the .env load above.
const prisma = new PrismaClient({ adapter: makeAdapter() });

const DEMO_EMAIL = 'demo@automate.app';
const DEMO_PASSWORD = 'Demo1234!';

async function main() {
  // Recreate the demo user from scratch so the seed is repeatable.
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });
  // Seeded wireframe posts have no author account — clear them too.
  await prisma.communityPost.deleteMany({ where: { authorId: null } });

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      name: 'John Doe',
      username: '@johndoe',
      phone: '+1 (703) 555-0198',
      initial: 'J',
      completionPct: 85,
    },
  });

  // ── Vehicle ──────────────────────────────────────────────────────────
  const vehicle = await prisma.vehicle.create({
    data: {
      userId: user.id,
      name: '2019 Honda Accord EX-L',
      colorName: 'Lunar Silver Metallic',
      vin: '1HGCV1F34KA01234',
      odometerMi: 47230,
      oilSpec: '5W-30 Full Synthetic',
      lastService: 'Mar 12, 2025',
      healthPct: 78,
      healthLabel: 'Good',
      oilDueInMi: 800,
      isPrimary: true,
      marketValue: { value: 17400, aboveAvg: 420, low: 14200, high: 21500, barPct: 67 },
    },
  });

  // ── Insurance policy ─────────────────────────────────────────────────
  await prisma.insurancePolicy.create({
    data: {
      userId: user.id,
      carrier: 'State Farm',
      coverage: 'Comprehensive + Collision',
      policyNumber: 'SF-8847234',
      accountNumber: 'SF-8847234',
      deductible: 500,
      premiumPerYear: 1200,
      covers: '2019 Honda Accord',
      renewal: 'Aug 15, 2027',
      claimsPhone: '1-800-STATE-FARM',
    },
  });

  // ── Damage request + the 8 wireframe quotes ──────────────────────────
  const request = await prisma.damageRequest.create({
    data: {
      userId: user.id,
      title: 'Rear bumper dent',
      city: 'Fairfax, VA',
      parts: [{ part: 'Rear bumper', type: 'Dent', photos: 3 }],
      photoRefs: [],
      aiType: 'Dent',
      aiPart: 'Rear bumper',
      aiSeverity: 'Paint intact',
      aiPriceLow: 285,
      aiPriceHigh: 480,
      aiConfidence: 0.87,
      shopsNotified: 12,
      status: 'quoted',
    },
  });

  const quotes = [
    { dealerId: 'autofix-pro', dealerName: 'AutoFix Pro', price: 285, priceHigh: null, note: 'Quick turnaround, 1-day repair for minor dents.', parts: 'Aftermarket', pinTop: 26, pinLeft: 20, tier: 'best', status: 'new' },
    { dealerId: 'honda-fairfax', dealerName: 'Honda Fairfax', price: 330, priceHigh: 345, note: 'PDR possible. 2-day turnaround, OEM paint match.', parts: 'OEM', pinTop: 44, pinLeft: 46, tier: 'recommended', status: 'new' },
    { dealerId: 'vienna-auto', dealerName: 'Vienna Auto Care', price: 345, priceHigh: null, note: 'Includes free paint protection after repair.', parts: 'Aftermarket', pinTop: 18, pinLeft: 62, tier: 'other', status: 'new' },
    { dealerId: 'fairfax-collision', dealerName: 'Fairfax Collision', price: 360, priceHigh: null, note: 'Certified body shop, lifetime warranty on repair.', parts: 'OEM', pinTop: 64, pinLeft: 24, tier: 'other', status: 'new' },
    { dealerId: 'chantilly-body', dealerName: 'Chantilly Auto Body', price: 375, priceHigh: null, note: 'Same-week appointments available.', parts: 'Aftermarket', pinTop: 70, pinLeft: 66, tier: 'other', status: 'new' },
    { dealerId: 'nova-dent', dealerName: 'NoVa Dent Works', price: 395, priceHigh: null, note: 'Specialists in paintless dent removal.', parts: 'OEM', pinTop: 8, pinLeft: 38, tier: 'other', status: 'new' },
    { dealerId: 'arlington-spa', dealerName: 'Arlington Auto Spa', price: 420, priceHigh: null, note: 'Premium service with loaner vehicle included.', parts: 'OEM', pinTop: 52, pinLeft: 78, tier: 'other', status: 'new' },
    { dealerId: 'premier-body', dealerName: 'Premier Body Shop', price: 480, priceHigh: null, note: 'Full-service shop with detailing add-ons.', parts: 'OEM', pinTop: 82, pinLeft: 46, tier: 'other', status: 'new' },
  ];
  for (const q of quotes) {
    await prisma.quote.create({ data: { damageRequestId: request.id, ...q } });
  }

  // ── Bookings: Apr 7 oil change (paid) + Apr 12 bumper repair (confirmed) ──
  const oilBooking = await prisma.booking.create({
    data: {
      userId: user.id,
      dealerId: 'honda-fairfax',
      dealerName: 'Honda Fairfax',
      kind: 'maintenance',
      services: [{ id: 'svc-oil', name: 'Oil change', price: 49, durationMin: 45 }],
      date: '2027-04-07',
      time: '8:00 AM',
      totalCents: 4900,
      status: 'paid',
    },
  });
  await prisma.payment.create({
    data: { userId: user.id, bookingId: oilBooking.id, amountCents: 4900, purpose: 'booking' },
  });

  await prisma.booking.create({
    data: {
      userId: user.id,
      dealerId: 'honda-fairfax',
      dealerName: 'Honda Fairfax',
      kind: 'repair',
      services: [{ name: 'Rear bumper repair', price: 320, priceHigh: 345 }],
      date: '2027-04-12',
      time: '9:00 AM',
      totalCents: 0, // pay at shop after estimate confirmation
      status: 'confirmed',
    },
  });

  // ── Service history ──────────────────────────────────────────────────
  await prisma.serviceHistoryRecord.createMany({
    data: [
      {
        userId: user.id,
        vehicleId: vehicle.id,
        type: 'Oil change',
        shop: 'AutoFix Pro',
        dateLabel: 'Mar 12',
        year: 2025,
        mileage: '44,500 mi',
        cost: 49,
        icon: '🛢️',
        source: 'seed',
        createdAt: new Date('2025-03-12T12:00:00Z'),
      },
      {
        userId: user.id,
        vehicleId: vehicle.id,
        type: 'Tire rotation',
        shop: 'Honda Fairfax',
        dateLabel: 'Dec 5',
        year: 2024,
        mileage: '42,100 mi',
        cost: 39,
        icon: '↺',
        source: 'seed',
        createdAt: new Date('2024-12-05T12:00:00Z'),
      },
    ],
  });

  // ── Points: 420-point opening balance ────────────────────────────────
  await prisma.pointsLedgerEntry.create({
    data: { userId: user.id, delta: 420, reason: 'Opening balance', balanceAfter: 420 },
  });

  // ── Notifications (wireframe s-notifications) ────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        icon: '💰',
        title: 'Honda Fairfax accepted your quote',
        agoLabel: '2 hours ago',
        body: 'Your rear bumper estimate ($320–$345) is ready. Tap to book your appointment.',
        unread: true,
        tint: 'primary',
        target: { screen: 'AcceptBooking', params: { dealerId: 'honda-fairfax' } },
      },
      {
        userId: user.id,
        icon: '🔧',
        title: 'Oil change due soon',
        agoLabel: 'Yesterday',
        body: 'Your 2019 Accord is ~800 miles from its next oil change. Schedule now with a partner dealer.',
        unread: true,
        tint: 'success',
        target: { screen: 'MaintSchedule', tab: 'MaintTab' },
      },
      {
        userId: user.id,
        icon: '🏆',
        title: 'You reached Gold tier!',
        agoLabel: '2 days ago',
        body: "Congrats — you've unlocked exclusive dealer discounts and early access to new features.",
        unread: true,
        tint: 'gold',
        target: { screen: 'ProfEarn', tab: 'ProfileTab' },
      },
      {
        userId: user.id,
        icon: '📊',
        title: '8 shops responded to your request',
        agoLabel: '3 days ago',
        body: 'AutoFix Pro quoted $295 — the lowest in your area. View all quotes.',
        unread: false,
        tint: 'neutral',
        target: { screen: 'DealerQuotes' },
      },
      {
        userId: user.id,
        icon: '💬',
        title: 'Sarah M. replied to your post',
        agoLabel: '4 days ago',
        body: '"That DIY dent trick actually works — saved me $400 too!"',
        unread: false,
        tint: 'neutral',
        target: { screen: 'CommPost', tab: 'CommunityTab', params: { postId: 'post-james' } },
      },
      {
        userId: user.id,
        icon: '📅',
        title: 'Upcoming: Honda Fairfax — Mon Apr 7',
        agoLabel: '5 days ago',
        body: 'Oil change at 8:00 AM. Reminder will be sent the day before.',
        unread: false,
        tint: 'neutral',
        target: { screen: 'MaintScheduleConfirm', tab: 'MaintTab' },
      },
    ],
  });

  // ── Community posts + comments (wireframe s-comm-honda / s-comm-post) ─
  const hour = 3600_000;
  const hoursAgo = (h: number) => new Date(Date.now() - h * hour);
  const jamesPost = await prisma.communityPost.create({
    data: {
      channelId: 'honda',
      createdAt: hoursAgo(2),
      authorName: 'James K.',
      initial: 'J',
      color: '#7F77DD',
      car: '2019 Accord EX-L',
      agoLabel: '2h ago',
      category: 'Tip',
      body: 'Used AutoMate for a rear bumper dent — submitted photos at midnight and woke up to 6 quotes from local shops. Honda Fairfax was $285, lowest by $60. Booked same day 👌',
      replies: 14,
      likes: 28,
      hasPhoto: true,
    },
  });
  await prisma.communityComment.createMany({
    data: [
      { postId: jamesPost.id, authorName: 'Sarah M.', initial: 'S', color: '#1D9E75', car: '2021 Civic', likes: 5, body: 'That was amazing! I tried the same at 11 PM and got 5 quotes by 8:45 AM. After-hours timeline is so reassuring.' },
      { postId: jamesPost.id, authorName: 'Mike R.', initial: 'M', color: '#378ADD', car: '2020 Pilot', likes: 12, body: 'The DIY tip section on the submission screen helped me fix a dent while waiting. Saved $200!' },
      { postId: jamesPost.id, authorName: 'Anna T.', initial: 'A', color: '#EF9F27', car: '2018 CR-V', likes: 3, body: 'Which shop gave the best quote? I am in Fairfax too and had similar damage last month.' },
      { postId: jamesPost.id, authorName: 'Kevin L.', initial: 'K', color: '#7F77DD', car: '2022 Accord', likes: 8, body: 'The plunger method actually worked on mine haha. Thanks for the tip AutoMate!' },
    ],
  });

  await prisma.communityPost.createMany({
    data: [
      {
        channelId: 'honda',
        createdAt: hoursAgo(5),
        authorName: 'Sarah M.',
        initial: 'S',
        color: '#1D9E75',
        car: '2021 Civic Sport',
        agoLabel: '5h ago',
        category: 'Review',
        body: 'The Pro DIY guide for nail polish paint chip fix actually worked on my hood scratch. Saved $400 in labor. Paint match was perfect ✨',
        replies: 7,
        likes: 41,
      },
      {
        channelId: 'honda',
        createdAt: hoursAgo(8),
        authorName: 'Mike R.',
        initial: 'M',
        color: '#378ADD',
        car: '2020 Pilot',
        agoLabel: '8h ago',
        category: 'Question',
        body: "Insurance filed a claim for my door ding and my premium went up $180/yr. AutoMate's compare tool literally showed me it would cost more to insure than pay cash 🤦. Always check first!",
        replies: 22,
        likes: 67,
      },
      {
        channelId: 'honda',
        createdAt: hoursAgo(12),
        authorName: 'Alex T.',
        initial: 'A',
        color: '#E24B4A',
        car: '2022 CR-V',
        agoLabel: '12h ago',
        category: 'Warning',
        body: 'Heads up Fairfax Honda owners — some shops are quoting 2-3x market rate for bumper repairs right now. AutoMate showed me the range so I knew what was fair 👍',
        replies: 11,
        likes: 54,
      },
    ],
  });

  console.log(`Seeded demo user ${DEMO_EMAIL} / ${DEMO_PASSWORD} (OTP 123456)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
