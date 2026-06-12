import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AUTH_SECRET, TOKEN_TTL } from '../config';
import { prisma } from '../db';

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
}

// Attach req.user for downstream handlers.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, AUTH_SECRET, { expiresIn: TOKEN_TTL });
}

/** Bearer-JWT guard: verifies the token and attaches `req.user`. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  try {
    const payload = jwt.verify(token, AUTH_SECRET) as jwt.JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
    if (!user) return res.status(401).json({ error: 'Unknown user' });
    req.user = { id: user.id, email: user.email, name: user.name };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
