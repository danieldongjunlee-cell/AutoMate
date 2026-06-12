import { Router } from 'express';

import { prisma } from '../db';
import { agoLabel } from '../staticData';

export const notificationsRouter = Router();

// GET /notifications — AppNotification shape, newest first
notificationsRouter.get('/', async (req, res) => {
  const items = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(
    items.map((n) => ({
      id: n.id,
      icon: n.icon,
      title: n.title,
      ago: n.agoLabel ?? agoLabel(n.createdAt),
      body: n.body,
      unread: n.unread,
      tint: n.tint,
      ...(n.target ? { target: n.target } : {}),
    })),
  );
});

// POST /notifications/read-all
notificationsRouter.post('/read-all', async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, unread: true },
    data: { unread: false },
  });
  return res.json({ ok: true });
});

// POST /notifications/:id/read
notificationsRouter.post('/:id/read', async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.id },
    data: { unread: false },
  });
  return res.json({ ok: true });
});
