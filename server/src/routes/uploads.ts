import { Router } from 'express';
import multer from 'multer';

import { storage } from '../storage';

export const uploadsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 8 },
});

// POST /uploads (multipart, field "files") → [{ ref, url }]
// Damage photos and receipt scans land here; the returned refs are stored on
// damage_requests.photo_refs / service_history.image_ref.
uploadsRouter.post('/', upload.array('files'), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  const stored = await Promise.all(
    files.map((f) =>
      storage.save({ buffer: f.buffer, originalName: f.originalname, mimeType: f.mimetype }),
    ),
  );
  return res.json({ ok: true, files: stored });
});
