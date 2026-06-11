/**
 * Mock auth service. Swap with real API calls later — screens only depend on
 * these signatures.
 */

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const MOCK_PHONE = '+1 (703) 555-0198';

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export const authService = {
  async signUp(_input: SignUpInput): Promise<{ otpSentTo: string }> {
    await delay(600);
    return { otpSentTo: MOCK_PHONE };
  },

  async logIn(_email: string, _password: string): Promise<{ otpSentTo: string }> {
    await delay(600);
    return { otpSentTo: MOCK_PHONE };
  },

  /** Any 6-digit code is accepted by the mock. */
  async verifyOtp(code: string): Promise<{ ok: boolean }> {
    await delay(500);
    return { ok: code.length === 6 };
  },

  async resendOtp(): Promise<{ otpSentTo: string }> {
    await delay(400);
    return { otpSentTo: MOCK_PHONE };
  },

  async socialLogIn(_provider: 'apple' | 'google'): Promise<{ ok: boolean }> {
    await delay(700);
    return { ok: true };
  },
};
