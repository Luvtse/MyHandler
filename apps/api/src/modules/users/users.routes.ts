import { Router } from 'express';
import prisma from '../../utils/prisma';

import { requireAuth, requirePermission } from '../../services/authService';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

export const usersRouter = Router();

// All routes require authentication
usersRouter.use(requireAuth);

// User profile routes (available to all authenticated users)
usersRouter.get('/profile', async (req, res) => {
  const userId = (req as any).user?.sub;
  const user = await prisma.user.findUnique({ 
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
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

usersRouter.put('/profile', async (req, res) => {
  const userId = (req as any).user?.sub;
  const { name, email, phone, profilePicture, currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updateData: any = { name, email, phone, profilePicture };

  if (newPassword) {
    if (!currentPassword) return res.status(400).json({ error: 'Current password required' });
    const ok = await bcrypt.compare(currentPassword, user.password || '');
    if (!ok) return res.status(401).json({ error: 'Invalid current password' });
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.user.update({ where: { id: userId }, data: updateData });
  res.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });
});

// Get email preferences
usersRouter.get('/email-preferences', async (req, res) => {
  const userId = (req as any).user?.sub;
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { emailPreferences: true }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ emailPreferences: user.emailPreferences || {} });
});

// Update email preferences
usersRouter.put('/email-preferences', async (req, res) => {
  const userId = (req as any).user?.sub;
  const { emailPreferences } = req.body;
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = await prisma.user.update({ 
    where: { id: userId }, 
    data: { emailPreferences }
  });
  
  res.json({ emailPreferences: updated.emailPreferences });
});

// Admin-only user management routes
usersRouter.get('/', requirePermission('user:read_all'), async (req, res) => {
  try {
    const { page = '1', limit = '10', search = '', role = '', status = 'all' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
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
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count({ where })
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
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
usersRouter.get('/stats', requirePermission('user:read_all'), async (_req, res) => {
  try {
    const total = await prisma.user.count();
    const active = await prisma.user.count({ where: { role: 'customer' } }); // Assuming customers are active users
    const verified = await prisma.user.count(); // All users are considered verified by default
    
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    res.json({
      total,
      active,
      verified,
      roles: roleStats.map(r => ({ role: r.role, count: r._count }))
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});
usersRouter.get('/export', requirePermission('user:read_all'), async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const users = await prisma.user.findMany({
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
      const csv = users.map(u => 
        `${u.id},${u.name},${u.email},${u.role},${u.createdAt}`
      ).join('\n');
      res.header('Content-Type', 'text/csv');
      res.attachment('users.csv');
      res.send(`ID,Name,Email,Role,CreatedAt\n${csv}`);
    } else {
      res.json({ users });
    }
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
});
usersRouter.get('/activities', requirePermission('user:read_all'), async (_req, res) => {
  try {
    const activities = await prisma.user.findMany({
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
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});
usersRouter.get('/:id', requirePermission('user:read_all'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});
usersRouter.post('/', requirePermission('user:create'), async (req, res) => {
  try {
    const { name, email, role, phone, password = 'temp123456' } = req.body;
    
    if (!name || !email || !role || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        phone: String(phone),
        password: hashed
      }
    });

    res.status(201).json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});
usersRouter.patch('/:id', requirePermission('user:update_all'), async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
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

    res.json({ user: updated });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});
usersRouter.patch('/:id/approval', requirePermission('user:update_all'), async (req, res) => {
  try {
    const { isApproved } = req.body as { isApproved?: boolean };
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ error: 'isApproved must be a boolean' });
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updated = await prisma.user.update({
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
    res.json({ user: updated });
  } catch (error) {
    console.error('Error updating approval:', error);
    res.status(500).json({ error: 'Failed to update approval status' });
  }
});
usersRouter.delete('/:id', requirePermission('user:delete_all'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
usersRouter.patch('/:id/toggle-status', requirePermission('user:update_all'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: user.role === 'customer' ? 'driver' : 'customer' }, // Toggle between customer and driver roles
      select: { id: true, role: true }
    });

    res.json({ user: updated });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});
usersRouter.patch('/:id/verify', requirePermission('user:update_all'), async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: 'customer' }, // Set role to customer as verification
      select: { id: true, role: true }
    });

    res.json({ user: updated });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});
usersRouter.patch('/:id/role', requirePermission('user:assign_role'), async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, role: true }
    });

    res.json({ user: updated });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});
usersRouter.post('/:id/reset-password', requirePermission('user:update_all'), async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashed }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Legacy admin list route (can be removed once frontend is updated)
usersRouter.get('/admin/list', requirePermission('user:read_all'), async (_req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  res.json({ users });
});

export default usersRouter;
