import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { DEMO_OTP } from '../config';
import { prisma } from '../db';
import { signToken } from '../middleware/auth';

export const authRouter = Router();

/** Mask a phone for the "Code sent to …" OTP screen. */
const otpDestination = (phone: string | null) => phone ?? '+1 (703) 555-0198';

// POST /auth/signup { fullName, email, phone, password }
authRouter.post('/signup', async (req, res) => {
  const { fullName, email, phone, password } = req.body ?? {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email and password are required' });
  }
  const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const user = await prisma.user.create({
    data: {
      email: String(email).toLowerCase(),
      passwordHash: await bcrypt.hash(String(password), 10),
      name: String(fullName),
      phone: phone ? String(phone) : null,
      initial: String(fullName).trim().charAt(0).toUpperCase() || 'U',
    },
  });
  return res.json({ otpSentTo: otpDestination(user.phone) });
});

// POST /auth/login { email, password } → bcrypt check, then OTP step
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = email
    ? await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } })
    : null;
  if (!user || !(await bcrypt.compare(String(password ?? ''), user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  return res.json({ otpSentTo: otpDestination(user.phone) });
});

// POST /auth/verify-otp { email, code } → JWT session (demo code 123456)
authRouter.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body ?? {};
  const user = email
    ? await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } })
    : null;
  if (!user) return res.status(401).json({ ok: false, error: 'Unknown account' });
  if (String(code) !== DEMO_OTP) {
    return res.status(401).json({ ok: false, error: 'Invalid verification code' });
  }
  return res.json({
    ok: true,
    token: signToken(user.id),
    user: { name: user.name, email: user.email },
  });
});

// POST /auth/resend-otp { email, method?, destination? }
// method/destination back the VerifyMethod screen (email vs SMS choice); when
// given, the chosen destination is echoed back as otpSentTo.
authRouter.post('/resend-otp', async (req, res) => {
  const { email, method, destination } = req.body ?? {};
  const user = email
    ? await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } })
    : null;
  return res.json({
    otpSentTo: destination ? String(destination) : otpDestination(user?.phone ?? null),
    method: method === 'email' ? 'email' : 'sms',
  });
});

// POST /auth/social { provider } — demo shortcut: signs in as the seeded demo
// user (real Apple/Google OAuth lands in a later phase).
authRouter.post('/social', async (_req, res) => {
  const user = await prisma.user.findUnique({ where: { email: 'demo@automate.app' } });
  if (!user) return res.status(500).json({ ok: false, error: 'Demo user not seeded' });
  return res.json({
    ok: true,
    token: signToken(user.id),
    user: { name: user.name, email: user.email },
  });
});
