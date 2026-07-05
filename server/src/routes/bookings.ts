import { Router } from 'express';

import { EARN_RULES } from '../config';
import { awardPoints, prisma } from '../db';
import { DEALER_NAMES } from '../staticData';

export const bookingsRouter = Router();

// GET /bookings — the user's bookings, newest first
bookingsRouter.get('/', async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: { payment: true },
  });
  return res.json(bookings);
});

// POST /bookings { dealerId, dateLabel, time, services?, kind? } — repair-flow
// "Book appointment" (mirrors quoteService.bookAppointment).
bookingsRouter.post('/', async (req, res) => {
  const { dealerId, dateLabel, time, services, kind } = req.body ?? {};
  if (!dealerId) return res.status(400).json({ error: 'dealerId is required' });

  await prisma.booking.create({
    data: {
      userId: req.user!.id,
      dealerId: String(dealerId),
      dealerName: DEALER_NAMES[String(dealerId)] ?? String(dealerId),
      kind: kind === 'maintenance' ? 'maintenance' : 'repair',
      services: Array.isArray(services) ? services : [],
      date: dateLabel ? String(dateLabel) : null,
      time: time ? String(time) : null,
      status: 'confirmed',
    },
  });
  const pointsEarned = EARN_RULES.bookService;
  await awardPoints(req.user!.id, pointsEarned, 'Book service via app');
  return res.json({ ok: true, reminder: '1 day before', pointsEarned });
});

// POST /bookings/pay { total, dealerId?, services?, date?, time? } —
// maintenance checkout (mirrors maintService.payForBooking).
bookingsRouter.post('/pay', async (req, res) => {
  const { total, dealerId, services, date, time } = req.body ?? {};
  const amountCents = Math.round(Number(total ?? 0) * 100);

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.id,
      dealerId: String(dealerId ?? 'honda-fairfax'),
      dealerName: DEALER_NAMES[String(dealerId ?? 'honda-fairfax')] ?? String(dealerId),
      kind: 'maintenance',
      services: Array.isArray(services) ? services : [],
      date: date ? String(date) : null,
      time: time ? String(time) : null,
      totalCents: amountCents,
      status: 'paid',
    },
  });
  await prisma.payment.create({
    data: { userId: req.user!.id, bookingId: booking.id, amountCents, purpose: 'booking' },
  });
  const pointsEarned = EARN_RULES.bookService;
  await awardPoints(req.user!.id, pointsEarned, 'Book service via app');
  return res.json({ ok: true, reminder: 'day before at 9:00 AM', pointsEarned });
});
