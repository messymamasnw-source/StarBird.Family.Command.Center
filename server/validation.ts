import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { config } from './config';
import { prisma } from './db';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function issueToken(user: AuthUser) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwtSecret) as AuthUser;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const membership = await prisma.householdMembership.findFirst({
      where: { userId: user.id },
      include: { household: true },
    });

    (req as any).user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      householdId: membership?.householdId ?? null,
      role: membership?.role ?? null,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireHouseholdAccess(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as { householdId?: string | null; role?: string | null };

  if (!user?.householdId) {
    return res.status(403).json({ message: 'No household access' });
  }

  if (user.role === 'CHILD') {
    return res.status(403).json({ message: 'Child accounts cannot access adult-only household operations' });
  }

  return next();
}

export function requireRole(role: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: string | null };
    const allowed = Array.isArray(role) ? role : [role];

    if (!user?.role || !allowed.includes(user.role)) {
      return res.status(403).json({ message: 'Role access denied' });
    }

    return next();
  };
}
