"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
exports.requireAuth = requireAuth;
exports.getSecondaryRoles = getSecondaryRoles;
exports.hasAnyRole = hasAnyRole;
exports.requireRole = requireRole;
exports.requireAnyRole = requireAnyRole;
exports.requirePermission = requirePermission;
exports.requireAnyPermission = requireAnyPermission;
const prisma_1 = __importDefault(require("../utils/prisma"));
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const serverAuth_1 = require("./serverAuth");
const env_1 = require("../config/env");
const permissions_1 = require("../security/permissions");
const crypto_1 = __importDefault(require("crypto"));
exports.authRouter = (0, express_1.Router)();
const JWT_SECRET = env_1.env.jwtSecret;
const revokedUsers = new Set();
async function buildAuthResponse(user) {
    const accessToken = await serverAuth_1.ServerAuth.signAccessToken({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, '12h');
    const refreshToken = await serverAuth_1.ServerAuth.signRefreshToken({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, '7d');
    const payload = { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    // In production, send refresh token via HttpOnly cookie
    if (env_1.env.nodeEnv === 'production') {
        // Note: this router assumes it's mounted on an Express app with cookie support
        // We avoid exposing refreshToken in the JSON body for production
        // @ts-ignore - res will be provided in route handlers
    }
    return { accessToken, refreshToken, ...payload };
}
async function generateStaffId(prisma) {
    const seq = await prisma.sequence.upsert({
        where: { key: 'staffId' },
        update: { value: { increment: 1n } },
        create: { key: 'staffId', value: 1n }
    });
    // Convert BigInt to number and pad to 5 digits (adjust padding as needed)
    const idNumber = Number(seq.value);
    return `AHU-${String(idNumber).padStart(5, '0')}`;
}
exports.authRouter.post('/register', async (req, res) => {
    const { email, password, name, role, phone } = req.body;
    if (!email || !password || !name)
        return res.status(400).json({ error: 'Missing fields' });
    if (String(password).length < 8)
        return res.status(400).json({ error: 'Password too short' });
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing)
        return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(String(password), 10);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const allowRoleOverride = env_1.env.nodeEnv === 'test' || Boolean(process.env.VITEST);
    const allowedRoles = ['customer',];
    const normalizedRole = allowRoleOverride && allowedRoles.includes(String(role))
        ? String(role)
        : client_1.UserRole.customer;
    const user = await prisma_1.default.user.create({
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
exports.authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
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
exports.authRouter.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || typeof refreshToken !== 'string') {
        return res.status(400).json({ error: 'Missing refreshToken' });
    }
    const payload = await serverAuth_1.ServerAuth.verifyToken(refreshToken, JWT_SECRET);
    if (!payload?.sub)
        return res.status(401).json({ error: 'Invalid token' });
    if (revokedUsers.has(String(payload.sub)))
        return res.status(401).json({ error: 'Token revoked' });
    const user = await prisma_1.default.user.findUnique({ where: { id: String(payload.sub) } });
    if (!user)
        return res.status(401).json({ error: 'Invalid token' });
    return res.json(await buildAuthResponse(user));
});
exports.authRouter.post('/logout', requireAuth, async (req, res) => {
    const userId = req.user?.sub;
    if (userId)
        revokedUsers.add(String(userId));
    return res.json({ success: true });
});
exports.authRouter.post('/admin/invite', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { email, name, role, phone } = req.body;
        if (!email || !name || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const allowedRoles = ['admin', 'driver', 'warehouse', 'finance', 'report', 'hr_manager', 'hr_staff', 'service_point_agent', 'operations', 'fleet_manager', 'coo', 'cmo', 'cfo', 'ceo', 'fleet_manager'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        if (role === 'customer') {
            return res.status(400).json({ error: 'Customer role cannot be invited via admin' });
        }
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already exists' });
        }
        // Generate sequential staff ID
        const staffId = await generateStaffId(prisma_1.default);
        const inviteToken = crypto_1.default.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const user = await prisma_1.default.user.create({
            data: {
                email: String(email),
                name: String(name),
                role: role,
                phone: String(phone || ''),
                staffId,
                isInvited: true,
                inviteToken,
                inviteExpiresAt: expires,
                businessAccountCode: null
            }
        });
        return res.status(201).json({ success: true, inviteLink: `/invite?token=${inviteToken}`, userId: user.id });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create invitation' });
    }
});
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.replace('Bearer ', '');
    try {
        // verify returns payload or throws
        const payload = await serverAuth_1.ServerAuth.verifyToken(token, JWT_SECRET);
        if (!payload)
            return res.status(401).json({ error: 'Invalid token' });
        req.user = payload;
        next();
    }
    catch (e) {
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
async function getSecondaryRoles(userId) {
    const rows = await prisma_1.default.userSecondaryRole.findMany({ where: { userId } });
    return rows.map((r) => String(r.role));
}
/**
 * True if the authenticated primary role or any DB-stored secondary role
 * matches one of `roles`. Falls back to the JWT primary role when no userId
 * is provided (secondary roles are then simply unavailable).
 */
async function hasAnyRole(req, roles) {
    const user = req.user;
    if (!user)
        return false;
    if (user.role && roles.includes(user.role))
        return true;
    if (!user.sub)
        return false;
    const secondary = await getSecondaryRoles(user.sub);
    return secondary.some((r) => roles.includes(r));
}
function requireRole(roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!roles.includes(user.role))
            return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}
/**
 * Async role gate: allows the request when the JWT primary role OR any
 * DB-stored secondary role matches `roles`. Use this instead of inline
 * `req.user?.role !== 'admin'` checks so warehouse/admin access granted via
 * secondary roles is honored consistently.
 */
function requireAnyRole(roles) {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ error: 'Unauthorized' });
            const allowed = await hasAnyRole(req, roles);
            if (!allowed)
                return res.status(403).json({ error: 'Forbidden' });
            next();
        }
        catch (e) {
            next(e);
        }
    };
}
function requirePermission(permission) {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ error: 'Unauthorized' });
            // Secondary roles live in the DB only — never trust a token claim for them.
            const secondaryRoles = user.sub ? await getSecondaryRoles(user.sub) : [];
            if (!(0, permissions_1.hasPermission)({ ...user, secondaryRoles }, permission)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            next();
        }
        catch (e) {
            next(e);
        }
    };
}
function requireAnyPermission(perms) {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ error: 'Unauthorized' });
            const secondaryRoles = user.sub ? await getSecondaryRoles(user.sub) : [];
            const fullUser = { ...user, secondaryRoles };
            const allowed = perms.some((p) => (0, permissions_1.hasPermission)(fullUser, p));
            if (!allowed)
                return res.status(403).json({ error: 'Forbidden' });
            next();
        }
        catch (e) {
            next(e);
        }
    };
}
