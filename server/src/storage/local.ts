import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import { StorageProvider, StoredFile } from './StorageProvider';

/** Local-disk storage; files are served by Express from /uploads. */
export class LocalStorageProvider implements StorageProvider {
  constructor(
    private readonly rootDir: string,
    private readonly publicOrigin: string,
  ) {}

  async save(file: { buffer: Buffer; originalName: string; mimeType: string }): Promise<StoredFile> {
    const ext = path.extname(file.originalName) || extFromMime(file.mimeType);
    const now = new Date();
    const ref = path.posix.join(
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, '0'),
      `${randomBytes(12).toString('hex')}${ext}`,
    );
    const abs = path.join(this.rootDir, ref);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, file.buffer);
    return { ref, url: this.publicUrl(ref) };
  }

  publicUrl(ref: string): string {
    return `${this.publicOrigin}/uploads/${ref}`;
  }
}

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/heic') return '.heic';
  if (mime === 'application/pdf') return '.pdf';
  return '';
}
