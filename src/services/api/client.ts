/**
 * Thin fetch wrapper for the AutoMate server (server/).
 * Base URL comes from EXPO_PUBLIC_API_URL; the bearer token lives in the
 * Zustand store (useAppStore.authToken), set by the auth service after OTP.
 */
import { useAppStore } from '../../store/useAppStore';

const rawUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

/** API origin without a trailing slash (e.g. "http://localhost:4000"). */
export const API_URL = rawUrl.replace(/\/+$/, '');

/** True when the app should talk to the real server instead of the mocks. */
export const apiEnabled = API_URL.length > 0;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** JSON body; implies POST unless `method` is set. */
  body?: unknown;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = useAppStore.getState().authToken;
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status);
  }
  return data as T;
}
