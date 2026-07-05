import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import { PORT } from './config';
import { requireAuth } from './middleware/auth';
import { authRouter } from './routes/auth';
import { bookingsRouter } from './routes/bookings';
import { communityRouter } from './routes/community';
import { compareRouter } from './routes/compare';
import { insuranceRouter } from './routes/insurance';
import { maintenanceRouter } from './routes/maintenance';
import { notificationsRouter } from './routes/notifications';
import { pointsRouter } from './routes/points';
import { proRouter } from './routes/pro';
import { profileRouter } from './routes/profile';
import { quotesRouter } from './routes/quotes';
import { uploadsRouter } from './routes/uploads';
import { uploadsRoot } from './storage';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'automate-server' }));

// Public
app.use('/auth', authRouter);
// GET /uploads/* serves stored files; non-GET falls through to the
// authenticated upload router below.
app.use('/uploads', express.static(uploadsRoot));

// Authenticated
app.use('/quotes', requireAuth, quotesRouter);
app.use('/bookings', requireAuth, bookingsRouter);
app.use('/maintenance', requireAuth, maintenanceRouter);
app.use('/notifications', requireAuth, notificationsRouter);
app.use('/community', requireAuth, communityRouter);
app.use('/compare', requireAuth, compareRouter);
app.use('/insurance', requireAuth, insuranceRouter);
app.use('/profile', requireAuth, profileRouter);
app.use('/points', requireAuth, pointsRouter);
app.use('/pro', requireAuth, proRouter);
app.use('/uploads', requireAuth, uploadsRouter);

// Centralized error handler — keeps route code throw-friendly.
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AutoMate server listening on http://localhost:${PORT}`);
  });
}
