/**
 * Storage abstraction for user uploads (damage photos, receipt scans).
 * Local-disk implementation today; swap in an S3-compatible provider later
 * by implementing this interface and changing `storage` in ./index.ts.
 */
export interface StoredFile {
  /** Opaque reference persisted in the DB (e.g. "2026/06/abc123.jpg"). */
  ref: string;
  /** Public URL the app can render. */
  url: string;
}

export interface StorageProvider {
  save(file: { buffer: Buffer; originalName: string; mimeType: string }): Promise<StoredFile>;
  publicUrl(ref: string): string;
}
