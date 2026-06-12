import { Router } from 'express';
import multer from 'multer';

import { extractReceipt } from '../damageAi';
import { awardPoints, prisma } from '../db';
import { UPCOMING_SERVICES } from '../staticData';
import { storage } from '../storage';

export const maintenanceRouter = Router();

const scanUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
});

// GET /maintenance/vehicle — the user's primary vehicle (VEHICLE shape)
maintenanceRouter.get('/vehicle', async (req, res) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { userId: req.user!.id },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });
  if (!vehicle) return res.status(404).json({ error: 'No vehicle on file' });
  return res.json({
    name: vehicle.name,
    colorName: vehicle.colorName ?? '',
    vin: vehicle.vin ?? '',
    odometerMi: vehicle.odometerMi,
    oilSpec: vehicle.oilSpec ?? '',
    lastService: vehicle.lastService ?? '',
    healthPct: vehicle.healthPct,
    healthLabel: vehicle.healthLabel,
    oilDueInMi: vehicle.oilDueInMi ?? 0,
    marketValue: vehicle.marketValue ?? { value: 0, aboveAvg: 0, low: 0, high: 0, barPct: 0 },
  });
});

// GET /maintenance/upcoming — upcoming-service reminders
maintenanceRouter.get('/upcoming', async (_req, res) => {
  return res.json(UPCOMING_SERVICES);
});

// GET /maintenance/history — service records, newest first (ServiceRecord shape)
maintenanceRouter.get('/history', async (req, res) => {
  const records = await prisma.serviceHistoryRecord.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(
    records.map((r) => ({
      id: r.id,
      type: r.type,
      shop: r.shop,
      dateLabel: r.dateLabel,
      year: r.year,
      mileage: r.mileage,
      cost: r.cost,
      icon: r.icon,
    })),
  );
});

// POST /maintenance/scan — receipt photo (multipart "file", optional while the
// RN camera is simulated) → extracted fields for the scan-review screen.
// Forwards to the damage-AI /receipt endpoint; extractReceipt degrades to the
// canonical mock receipt when the service is down, so this never 500s.
maintenanceRouter.post('/scan', scanUpload.single('file'), async (req, res) => {
  const file = req.file
    ? { buffer: req.file.buffer, mimeType: req.file.mimetype }
    : undefined;
  // Keep the original scan for the history record's imageRef.
  const stored = req.file
    ? await storage.save({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      })
    : null;
  const receipt = await extractReceipt(file);
  return res.json({
    // SCANNED_RECEIPT shape, ready for the scan-review screen
    serviceType: receipt.serviceType,
    shop: receipt.vendor,
    date: receipt.date,
    mileage: receipt.mileage,
    amount: `$${receipt.total.toFixed(2)}`,
    // raw extraction extras
    lineItems: receipt.lineItems,
    total: receipt.total,
    modelMode: receipt.modelMode,
    imageRef: stored?.ref ?? null,
  });
});

// POST /maintenance/history { record: { type, shop, dateLabel, year, mileage, cost },
//   source: 'scan' | 'manual', imageRef?, extracted? } — save a record (+pts)
maintenanceRouter.post('/history', async (req, res) => {
  const { record, source, imageRef, extracted } = req.body ?? {};
  if (!record?.type || !record?.shop) {
    return res.status(400).json({ error: 'record.type and record.shop are required' });
  }
  const vehicle = await prisma.vehicle.findFirst({
    where: { userId: req.user!.id },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });
  await prisma.serviceHistoryRecord.create({
    data: {
      userId: req.user!.id,
      vehicleId: vehicle?.id ?? null,
      type: String(record.type),
      shop: String(record.shop),
      dateLabel: String(record.dateLabel ?? ''),
      year: Number(record.year ?? new Date().getFullYear()),
      mileage: String(record.mileage ?? ''),
      cost: Number(record.cost ?? 0),
      icon: String(record.type).toLowerCase().includes('tire') ? '↺' : '🛢️',
      source: source === 'scan' ? 'scan' : 'manual',
      imageRef: imageRef ? String(imageRef) : null,
      extracted: extracted ?? undefined,
    },
  });
  const pointsEarned = source === 'scan' ? 20 : 10; // scan receipt / manual log
  await awardPoints(
    req.user!.id,
    pointsEarned,
    source === 'scan' ? 'Scan service receipt' : 'Manual service log',
  );
  return res.json({ ok: true, pointsEarned });
});
