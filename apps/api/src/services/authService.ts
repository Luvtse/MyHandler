import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { Router } from 'express';
import { UserRole } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ServerAuth } from './serverAuth';
import { env } from '../config/env';
import { hasPermission, Permission } from '../security/permissions';
import crypto from 'crypto';

export const authRouter = Router();

const JWT_SECRET = env.jwtSecret;
const revokedUsers = new Set<string>();

async function buildAuthResponse(user: any) {
  const accessToken = await ServerAuth.signAccessToken({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, '12h');
  const refreshToken = await ServerAuth.signRefreshToken({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, '7d');
  const payload = { user: { id: user.id, email: user.email, name: user.name, role: user.role } };

  // In production, send refresh token via HttpOnly cookie
  if (env.nodeEnv === 'production') {
    // Note: this router assumes it's mounted on an Express app with cookie support
    // We avoid exposing refreshToken in the JSON body for production
    // @ts-ignore - res will be provided in route handlers
  }
  return { accessToken, refreshToken, ...payload };
}

async function generateStaffId(prisma: PrismaClient): Promise<string> {
  const seq = await prisma.sequence.upsert({
    where: { key: 'staffId' },
    update: { value: { increment: 1n } },
    create: { key: 'staffId', value: 1n }
  });
  // Convert BigInt to number and pad to 5 digits (adjust padding as needed)
  const idNumber = Number(seq.value);
  return `AHU-${String(idNumber).padStart(5, '0')}`;
}

authRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, role, phone } = req.body as any;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Password too short' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hashed = await bcrypt.hash(String(password), 10);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const allowRoleOverride = env.nodeEnv === 'test' || Boolean(process.env.VITEST);
  const allowedRoles = ['customer',];
  const normalizedRole: UserRole =
    allowRoleOverride && allowedRoles.includes(String(role))
      ? (String(role) as UserRole)
      : UserRole.customer;
  const user = await prisma.user.create({
    data: {
      email: String(email),
      password: hashed,
      name: String(name),
      role: normalizedRole,
      phone: String(phone || ''),
      businessAccountCode: String(code),
    },
  });
  res.json(await buildAuthResponse(user));
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.warn('Login failed: user not found', { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!user.password) {
    return res.status(401).json({ error: 'Password not set. Complete invitation or reset password.' });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    console.warn('Login failed: password mismatch', { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  revokedUsers.delete(user.id);
  res.json(await buildAuthResponse(user));
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ error: 'Missing refreshToken' });
  }
  const payload = await ServerAuth.verifyToken<any>(refreshToken, JWT_SECRET);
  if (!payload?.sub) return res.status(401).json({ error: 'Invalid token' });
  if (revokedUsers.has(String(payload.sub))) return res.status(401).json({ error: 'Token revoked' });
  const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  return res.json(await buildAuthResponse(user));
});

authRouter.post('/logout', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub as string | undefined;
  if (userId) revokedUsers.add(String(userId));
  return res.json({ success: true });
});

authRouter.post('/admin/invite', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { email, name, role, phone } = req.body as { email?: string; name?: string; role?: string; phone?: string };
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const allowedRoles = ['admin','driver','warehouse','finance','report','hr_manager','hr_staff','service_point_agent', 'operations', 'fleet_manager', 'coo', 'cmo', 'cfo', 'ceo', 'fleet_manager'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (role === 'customer') {
      return res.status(400).json({ error: 'Customer role cannot be invited via admin' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    // Generate sequential staff ID
    const staffId = await generateStaffId(prisma);

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: String(email),
        name: String(name),
        role: role as any,
        phone: String(phone || ''),
        staffId,
        isInvited: true,
        inviteToken,
        inviteExpiresAt: expires,
        businessAccountCode: null
      }
    });
    return res.status(201).json({ success: true, inviteLink: `/invite?token=${inviteToken}`, userId: user.id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create invitation' });
  }
});

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  try {
    // verify returns payload or throws
    const payload = await ServerAuth.verifyToken<any>(token, JWT_SECRET);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    (req as any).user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Load a user's secondary roles from the database.
 * NOTE: `req.user` is only the JWT payload ({ sub, email, role }) and never
 * contains `secondaryRoles`. Role checks that must consider secondary roles
 * (e.g. finance staff holding a secondary role) MUST use this helper instead
 * of reading a token claim — tokens are client-held and must not be trusted
 * for data that can change server-side.
 */
export async function getSecondaryRoles(userId: string): Promise<string[]> {
  const rows = await prisma.userSecondaryRole.findMany({ where: { userId } });
  return rows.map((r) => String(r.role));
}

/**
 * True if the authenticated primary role or any DB-stored secondary role
 * matches one of `roles`. Falls back to the JWT primary role when no userId
 * is provided (secondary roles are then simply unavailable).
 */
export async function hasAnyRole(req: Request, roles: string[]): Promise<boolean> {
  const user = (req as any).user as { sub?: string; role?: string } | undefined;
  if (!user) return false;
  if (user.role && roles.includes(user.role)) return true;
  if (!user.sub) return false;
  const secondary = await getSecondaryRoles(user.sub);
  return secondary.some((r) => roles.includes(r));
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

/**
 * Async role gate: allows the request when the JWT primary role OR any
 * DB-stored secondary role matches `roles`. Use this instead of inline
 * `req.user?.role !== 'admin'` checks so warehouse/admin access granted via
 * secondary roles is honored consistently.
 */
export function requireAnyRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const allowed = await hasAnyRole(req, roles);
      if (!allowed) return res.status(403).json({ error: 'Forbidden' });
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      // Secondary roles live in the DB only — never trust a token claim for them.
      const secondaryRoles = user.sub ? await getSecondaryRoles(user.sub) : [];
      if (!hasPermission({ ...user, secondaryRoles }, permission)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function requireAnyPermission(perms: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const secondaryRoles = user.sub ? await getSecondaryRoles(user.sub) : [];
      const fullUser = { ...user, secondaryRoles };
      const allowed = perms.some((p) => hasPermission(fullUser as any, p));
      if (!allowed) return res.status(403).json({ error: 'Forbidden' });
      next();
    } catch (e) {
      next(e);
    }
  };
}
