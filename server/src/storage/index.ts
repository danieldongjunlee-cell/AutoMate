import path from 'path';

import { PUBLIC_ORIGIN, UPLOAD_DIR } from '../config';
import { LocalStorageProvider } from './local';
import { StorageProvider } from './StorageProvider';

export const uploadsRoot = path.resolve(process.cwd(), UPLOAD_DIR);

/** The active provider. Swap for an S3-compatible implementation later. */
export const storage: StorageProvider = new LocalStorageProvider(uploadsRoot, PUBLIC_ORIGIN);

export type { StorageProvider, StoredFile } from './StorageProvider';
