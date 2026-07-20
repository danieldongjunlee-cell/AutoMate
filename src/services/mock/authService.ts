/**
 * Mock auth service — same signatures as services/api/authService so the
 * service-layer mode switch (services/index.ts) is transparent to screens.
 *
 * Demo contract (spec §6): demo@automate.app / Demo1234! is the only valid
 * login; the OTP screen accepts 123456 in both mock and api mode.
 */
import { useAppStore } from '../../store/useAppStore';
import { delay } from './delay';
import { clearPolicies, seedDemoPolicies } from './insuranceService';

export const MOCK_PHONE = '+1 (703) 555-0198';

export const DEMO_EMAIL = 'demo@automate.app';
export const DEMO_PASSWORD = 'Demo1234!';
export const DEMO_OTP = '123456';

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

/** Verification channel chosen on the VerifyMethod screen. */
export type VerifyChannel = 'email' | 'sms';

const DEMO_USER = { name: 'John Doe', email: DEMO_EMAIL };

/** Whoever just passed login/sign-up — becomes store.user after the OTP. */
let pendingUser = DEMO_USER;

export const authService = {
  async signUp(input: SignUpInput): Promise<{ otpSentTo: string }> {
    await delay(600);
    pendingUser = { name: input.fullName.trim() || DEMO_USER.name, email: input.email.trim() };
    // Fresh account: no insurance on file until the user adds a policy.
    clearPolicies();
    return { otpSentTo: MOCK_PHONE };
  },

  /** Exact-match the demo credentials; anything else is rejected. */
  async logIn(email: string, password: string): Promise<{ otpSentTo: string }> {
    await delay(600);
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw new Error('Invalid email or password.\nDemo account: demo@automate.app / Demo1234!');
    }
    pendingUser = DEMO_USER;
    // Returning demo account behaves like an established user with insurance
    // already on file.
    seedDemoPolicies();
    return { otpSentTo: MOCK_PHONE };
  },

  /** Only the demo code 123456 verifies. */
  async verifyOtp(code: string): Promise<{ ok: boolean }> {
    await delay(500);
    const ok = code === DEMO_OTP;
    if (ok) useAppStore.getState().setAuth('mock-session-token', pendingUser);
    return { ok };
  },

  async resendOtp(): Promise<{ otpSentTo: string }> {
    await delay(400);
    return { otpSentTo: MOCK_PHONE };
  },

  /** Send the code via the channel picked on VerifyMethod (email or SMS). */
  async sendCode(_method: VerifyChannel, destination: string): Promise<{ otpSentTo: string }> {
    await delay(500);
    return { otpSentTo: destination };
  },

  async socialSignIn(_provider: 'apple' | 'google'): Promise<{ ok: boolean }> {
    await delay(700);
    seedDemoPolicies(); // social sign-in resolves to the established demo account
    useAppStore.getState().setAuth('mock-session-token', DEMO_USER);
    return { ok: true };
  },
};
