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
exports.usersRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const authService_1 = require("../../services/authService");
const auditLog_1 = require("../../middlewares/auditLog");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const USER_ROLES = [
    'admin', 'customer', 'driver', 'warehouse', 'finance', 'report',
    'hr_manager', 'hr_staff', 'service_point_agent', 'operations',
    'fleet_manager', 'account_manager', 'coo', 'cfo', 'cmo', 'ceo',
    'regional_manager',
];
// Audit helper — fire-and-forget, never affects the request.
function auditUser(req, action, entityId, changes) {
    (0, auditLog_1.audit)({ req, action, entity: 'User', entityId, changes }).catch(() => { });
}
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(USER_ROLES).optional(),
}).strict();
const approvalSchema = zod_1.z.object({
    isApproved: zod_1.z.boolean(),
}).strict();
const assignRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(USER_ROLES),
}).strict();
const resetPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
}).strict();
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(USER_ROLES),
    phone: zod_1.z.string().min(6).max(20),
    password: zod_1.z.never({ message: 'Passwords cannot be set via this endpoint. Use the invite flow.' }).optional(),
}).strict();
exports.usersRouter = (0, express_1.Router)();
// All routes require authentication
exports.usersRouter.use(authService_1.requireAuth);
// User profile routes (available to all authenticated users)
exports.usersRouter.get('/profile', async (req, res) => {
    const userId = req.user?.sub;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            businessAccountCode: true,
            isInvited: true,
            inviteExpiresAt: true,
            staffId: true,
            // isApproved may not exist in DB yet; handled when added
            // @ts-ignore
            isApproved: true
        }
    });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json(user);
});
exports.usersRouter.put('/profile', async (req, res) => {
    const userId = req.user?.sub;
    const { name, email, phone, profilePicture, currentPassword, newPassword } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const updateData = { name, email, phone, profilePicture };
    if (newPassword) {
        if (!currentPassword)
            return res.status(400).json({ error: 'Current password required' });
        const ok = await bcrypt.compare(currentPassword, user.password || '');
        if (!ok)
            return res.status(401).json({ error: 'Invalid current password' });
        updateData.password = await bcrypt.hash(newPassword, 10);
    }
    const updated = await prisma_1.default.user.update({ where: { id: userId }, data: updateData });
    res.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });
});
// Get email preferences
exports.usersRouter.get('/email-preferences', async (req, res) => {
    const userId = req.user?.sub;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { emailPreferences: true }
    });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json({ emailPreferences: user.emailPreferences || {} });
});
// Update email preferences
exports.usersRouter.put('/email-preferences', async (req, res) => {
    const userId = req.user?.sub;
    const { emailPreferences } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const updated = await prisma_1.default.user.update({
        where: { id: userId },
        data: { emailPreferences }
    });
    res.json({ emailPreferences: updated.emailPreferences });
});
// Admin-only user management routes
exports.usersRouter.get('/', (0, authService_1.requirePermission)('user:read_all'), async (req, res) => {
    try {
        const { page = '1', limit = '10', search = '', role = '', status = 'all' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        const s = String(search || '').trim();
        if (s) {
            where.OR = [
                { name: { contains: s, mode: 'insensitive' } },
                { email: { contains: s, mode: 'insensitive' } },
                { phone: { contains: s, mode: 'insensitive' } },
                { businessAccountCode: { contains: s } },
            ];
            if (/^\d{6}$/.test(s)) {
                where.OR.push({ businessAccountCode: s });
            }
        }
        if (role)
            where.role = role;
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                skip,
                take: limitNum,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isApproved: true,
                    businessAccountCode: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.default.user.count({ where })
        ]);
        res.json({
            users,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
exports.usersRouter.get('/stats', (0, authService_1.requirePermission)('user:read_all'), async (_req, res) => {
    try {
        const total = await prisma_1.default.user.count();
        const active = await prisma_1.default.user.count({ where: { role: 'customer' } }); // Assuming customers are active users
        const verified = await prisma_1.default.user.count(); // All users are considered verified by default
        const roleStats = await prisma_1.default.user.groupBy({
            by: ['role'],
            _count: true
        });
        res.json({
            total,
            active,
            verified,
            roles: roleStats.map(r => ({ role: r.role, count: r._count }))
        });
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});
exports.usersRouter.get('/export', (0, authService_1.requirePermission)('user:read_all'), async (req, res) => {
    try {
        const { format = 'json' } = req.query;
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        if (format === 'csv') {
            const csv = users.map(u => `${u.id},${u.name},${u.email},${u.role},${u.createdAt}`).join('\n');
            res.header('Content-Type', 'text/csv');
            res.attachment('users.csv');
            res.send(`ID,Name,Email,Role,CreatedAt\n${csv}`);
        }
        else {
            res.json({ users });
        }
    }
    catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({ error: 'Failed to export users' });
    }
});
exports.usersRouter.get('/activities', (0, authService_1.requirePermission)('user:read_all'), async (_req, res) => {
    try {
        const activities = await prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json({ activities });
    }
    catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({ error: 'Failed to fetch user activities' });
    }
});
exports.usersRouter.get('/:id', (0, authService_1.requirePermission)('user:read_all'), async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                emailPreferences: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
exports.usersRouter.post('/', (0, authService_1.requirePermission)('user:create'), async (req, res) => {
    try {
        // Staff/user provisioning MUST go through the invite flow
        // (POST /api/auth/admin/invite -> POST /api/invite/complete), where the
        // user sets their own password. The old `password = 'temp123456'` default
        // let accounts exist with a known shared password.
        const parsed = createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            });
        }
        const { name, email, role, phone } = parsed.data;
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already exists' });
        }
        const inviteToken = crypto_1.default.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                role,
                phone: String(phone),
                password: null,
                isInvited: true,
                inviteToken,
                inviteExpiresAt: expires,
            },
        });
        auditUser(req, 'CREATE', user.id, { email, role, invited: true });
        res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            },
            inviteLink: `/invite?token=${inviteToken}`,
            message: 'User created as invited. Share the invite link so they can set their own password.'
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});
exports.usersRouter.patch('/:id', (0, authService_1.requirePermission)('user:update_all'), async (req, res) => {
    try {
        const parsed = updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            });
        }
        const { name, email, role } = parsed.data;
        const user = await prisma_1.default.user.findUnique({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updated = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { name, email, role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        auditUser(req, 'UPDATE', updated.id, { fields: Object.keys(parsed.data) });
        res.json({ user: updated });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});
exports.usersRouter.patch('/:id/approval', (0, authService_1.requirePermission)('user:update_all'), async (req, res) => {
    try {
        const parsed = approvalSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            });
        }
        const { isApproved } = parsed.data;
        const user = await prisma_1.default.user.findUnique({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updated = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { isApproved },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isApproved: true,
                updatedAt: true
            }
        });
        auditUser(req, 'STATUS_CHANGE', updated.id, { field: 'isApproved', to: isApproved });
        res.json({ user: updated });
    }
    catch (error) {
        console.error('Error updating approval:', error);
        res.status(500).json({ error: 'Failed to update approval status' });
    }
});
exports.usersRouter.delete('/:id', (0, authService_1.requirePermission)('user:delete_all'), async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await prisma_1.default.user.delete({ where: { id: req.params.id } });
        // Recorded after deletion so the trail entry survives even though the FK target is gone.
        auditUser(req, 'DELETE', user.id, { email: user.email, role: user.role });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
exports.usersRouter.patch('/:id/toggle-status', (0, authService_1.requirePermission)('user:update_all'), async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const newRole = user.role === 'customer' ? 'driver' : 'customer'; // Toggle between customer and driver roles
        const updated = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { role: newRole },
            select: { id: true, role: true }
        });
        auditUser(req, 'STATUS_CHANGE', updated.id, { field: 'role', from: user.role, to: newRole });
        res.json({ user: updated });
    }
    catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ error: 'Failed to toggle user status' });
    }
});
exports.usersRouter.patch('/:id/verify', (0, authService_1.requirePermission)('user:update_all'), async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.params.id },
            select: { id: true, role: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updated = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { role: 'customer' }, // Set role to customer as verification
            select: { id: true, role: true }
        });
        auditUser(req, 'STATUS_CHANGE', updated.id, { field: 'role', action: 'verify', from: user.role, to: 'customer' });
        res.json({ user: updated });
    }
    catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ error: 'Failed to verify user' });
    }
});
exports.usersRouter.patch('/:id/role', (0, authService_1.requirePermission)('user:assign_role'), async (req, res) => {
    try {
        const parsed = assignRoleSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid role', details: parsed.error.issues[0]?.message });
        }
        const { role } = parsed.data;
        const user = await prisma_1.default.user.findUnique({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updated = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { role },
            select: { id: true, role: true }
        });
        auditUser(req, 'UPDATE', updated.id, { field: 'role', from: user.role, to: role });
        res.json({ user: updated });
    }
    catch (error) {
        console.error('Error assigning role:', error);
        res.status(500).json({ error: 'Failed to assign role' });
    }
});
exports.usersRouter.post('/:id/reset-password', (0, authService_1.requirePermission)('user:update_all'), async (req, res) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid password' });
        }
        const { password } = parsed.data;
        const user = await prisma_1.default.user.findUnique({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const hashed = await bcrypt.hash(password, 10);
        await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { password: hashed }
        });
        // Never log the plaintext password — record only that an admin reset occurred.
        auditUser(req, 'UPDATE', user.id, { field: 'password', action: 'admin_reset' });
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});
// Legacy admin list route (can be removed once frontend is updated)
exports.usersRouter.get('/admin/list', (0, authService_1.requirePermission)('user:read_all'), async (_req, res) => {
    const users = await prisma_1.default.user.findMany({ select: { id: true, email: true, name: true, role: true } });
    res.json({ users });
});
exports.default = exports.usersRouter;
