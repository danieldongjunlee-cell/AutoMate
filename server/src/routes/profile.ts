import { Router } from 'express';

import { prisma } from '../db';

export const profileRouter = Router();

// GET /profile — the signed-in user's profile
profileRouter.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    name: user.name,
    username: user.username ?? '',
    email: user.email,
    phone: user.phone ?? '',
    initial: user.initial,
    completionPct: user.completionPct,
  });
});

// PUT /profile { name?, username?, phone? }
profileRouter.put('/', async (req, res) => {
  const { name, username, phone } = req.body ?? {};
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name ? { name: String(name), initial: String(name).trim().charAt(0).toUpperCase() } : {}),
      ...(username !== undefined ? { username: String(username) } : {}),
      ...(phone !== undefined ? { phone: String(phone) } : {}),
    },
  });
  return res.json({ ok: true, user: { name: user.name, email: user.email } });
});

// DELETE /profile — permanently delete the account and all owned data
// (App Store guideline 5.1.1(v) requires in-app account deletion). Prisma
// cascades remove vehicles, damage requests + quotes, bookings, payments,
// service history, policies, points ledger, memberships and notifications;
// community posts survive but are detached (author_id → null), matching the
// seeded-author display path.
profileRouter.delete('/', async (req, res) => {
  await prisma.user.delete({ where: { id: req.user!.id } });
  return res.json({ ok: true });
});

// ── Vehicles CRUD (prof-cars) ──────────────────────────────────────────

profileRouter.get('/vehicles', async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });
  return res.json(vehicles);
});

profileRouter.post('/vehicles', async (req, res) => {
  const { name, colorName, vin, odometerMi, oilSpec } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const vehicle = await prisma.vehicle.create({
    data: {
      userId: req.user!.id,
      name: String(name),
      colorName: colorName ? String(colorName) : null,
      vin: vin ? String(vin) : null,
      odometerMi: Number(odometerMi ?? 0),
      oilSpec: oilSpec ? String(oilSpec) : null,
    },
  });
  return res.json({ ok: true, vehicle });
});

profileRouter.put('/vehicles/:id', async (req, res) => {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!existing) return res.status(404).json({ error: 'Vehicle not found' });
  const { name, colorName, vin, odometerMi, oilSpec, isPrimary } = req.body ?? {};
  const vehicle = await prisma.vehicle.update({
    where: { id: existing.id },
    data: {
      ...(name ? { name: String(name) } : {}),
      ...(colorName !== undefined ? { colorName: String(colorName) } : {}),
      ...(vin !== undefined ? { vin: String(vin) } : {}),
      ...(odometerMi !== undefined ? { odometerMi: Number(odometerMi) } : {}),
      ...(oilSpec !== undefined ? { oilSpec: String(oilSpec) } : {}),
      ...(isPrimary !== undefined ? { isPrimary: Boolean(isPrimary) } : {}),
    },
  });
  return res.json({ ok: true, vehicle });
});

profileRouter.delete('/vehicles/:id', async (req, res) => {
  await prisma.vehicle.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
  return res.json({ ok: true });
});

// ── Insurance policies CRUD (prof-ins-add / prof-ins-edit fields) ──────

profileRouter.get('/policies', async (req, res) => {
  const policies = await prisma.insurancePolicy.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(policies);
});

profileRouter.post('/policies', async (req, res) => {
  const { carrier, coverage, policyNumber, accountNumber, deductible, premiumPerYear, covers, renewal, claimsPhone } =
    req.body ?? {};
  if (!carrier || !policyNumber) {
    return res.status(400).json({ error: 'carrier and policyNumber are required' });
  }
  const policy = await prisma.insurancePolicy.create({
    data: {
      userId: req.user!.id,
      carrier: String(carrier),
      coverage: String(coverage ?? 'Comprehensive + Collision'),
      policyNumber: String(policyNumber),
      accountNumber: accountNumber ? String(accountNumber) : null,
      deductible: Number(deductible ?? 500),
      premiumPerYear: Number(premiumPerYear ?? 0),
      covers: covers ? String(covers) : null,
      renewal: renewal ? String(renewal) : null,
      claimsPhone: claimsPhone ? String(claimsPhone) : null,
    },
  });
  return res.json({ ok: true, policy });
});

profileRouter.put('/policies/:id', async (req, res) => {
  const existing = await prisma.insurancePolicy.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!existing) return res.status(404).json({ error: 'Policy not found' });
  const { carrier, coverage, policyNumber, accountNumber, deductible, premiumPerYear, covers, renewal, claimsPhone, status } =
    req.body ?? {};
  const policy = await prisma.insurancePolicy.update({
    where: { id: existing.id },
    data: {
      ...(carrier ? { carrier: String(carrier) } : {}),
      ...(coverage !== undefined ? { coverage: String(coverage) } : {}),
      ...(policyNumber ? { policyNumber: String(policyNumber) } : {}),
      ...(accountNumber !== undefined ? { accountNumber: String(accountNumber) } : {}),
      ...(deductible !== undefined ? { deductible: Number(deductible) } : {}),
      ...(premiumPerYear !== undefined ? { premiumPerYear: Number(premiumPerYear) } : {}),
      ...(covers !== undefined ? { covers: String(covers) } : {}),
      ...(renewal !== undefined ? { renewal: String(renewal) } : {}),
      ...(claimsPhone !== undefined ? { claimsPhone: String(claimsPhone) } : {}),
      ...(status !== undefined ? { status: String(status) } : {}),
    },
  });
  return res.json({ ok: true, policy });
});

profileRouter.delete('/policies/:id', async (req, res) => {
  await prisma.insurancePolicy.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
  return res.json({ ok: true });
});
