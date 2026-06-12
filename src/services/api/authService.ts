/**
 * Real auth service (server/). Same signatures as services/mock/authService.
 * On a successful OTP, stores the JWT + user in the Zustand store so every
 * subsequent request is authenticated.
 */
import { useAppStore } from '../../store/useAppStore';
import { DEMO_EMAIL, SignUpInput, VerifyChannel } from '../mock/authService';
import { ApiError, request } from './client';

interface SessionResponse {
  ok: boolean;
  token: string;
  user: { name: string; email: string };
}

/** Email of whoever just passed login/sign-up — verify-otp needs it. */
let pendingEmail = DEMO_EMAIL;

export const authService = {
  async signUp(input: SignUpInput): Promise<{ otpSentTo: string }> {
    pendingEmail = input.email.trim().toLowerCase();
    return request<{ otpSentTo: string }>('/auth/signup', {
      body: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        password: input.password,
      },
    });
  },

  async logIn(email: string, password: string): Promise<{ otpSentTo: string }> {
    pendingEmail = email.trim().toLowerCase();
    return request<{ otpSentTo: string }>('/auth/login', {
      body: { email: pendingEmail, password },
    });
  },

  /** Server accepts the demo code 123456 and returns a JWT session. */
  async verifyOtp(code: string): Promise<{ ok: boolean }> {
    try {
      const res = await request<SessionResponse>('/auth/verify-otp', {
        body: { email: pendingEmail, code },
      });
      useAppStore.getState().setAuth(res.token, res.user);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return { ok: false };
      throw err;
    }
  },

  async resendOtp(): Promise<{ otpSentTo: string }> {
    return request<{ otpSentTo: string }>('/auth/resend-otp', { body: { email: pendingEmail } });
  },

  /** Channel-aware resend (VerifyMethod). Hits /auth/resend-otp with the
   * method+destination params the server echoes back. */
  async sendCode(method: VerifyChannel, destination: string): Promise<{ otpSentTo: string }> {
    return request<{ otpSentTo: string }>('/auth/resend-otp', {
      body: { email: pendingEmail, method, destination },
    });
  },

  /** Demo shortcut: the server signs social logins in as the seeded user. */
  async socialSignIn(provider: 'apple' | 'google'): Promise<{ ok: boolean }> {
    try {
      const res = await request<SessionResponse>('/auth/social', { body: { provider } });
      useAppStore.getState().setAuth(res.token, res.user);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
};
