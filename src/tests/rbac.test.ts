import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { PrismaClient } from '@prisma/client';

const app = createApp();
const prisma = new PrismaClient();

const adminUser = { email: 'admin@test.com', password: 'password123', name: 'Admin User', role: 'admin' };
const customerUser = { email: 'customer@test.com', password: 'password123', name: 'Customer User' };

describe('RBAC: users admin list access control', () => {
  let adminAccessToken: string;
  let customerAccessToken: string;

  beforeAll(async () => {
    // cleanup
    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, customerUser.email] } } });

    // register admin and customer
    await request(app).post('/api/auth/register').send(adminUser);
    await request(app).post('/api/auth/register').send(customerUser);

    // login both
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminAccessToken = adminLogin.body.accessToken;
    const customerLogin = await request(app).post('/api/auth/login').send({ email: customerUser.email, password: customerUser.password });
    customerAccessToken = customerLogin.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [adminUser.email, customerUser.email] } } });
    await prisma.$disconnect();
  });

  it('allows admin to access /api/users/admin/list', async () => {
    const res = await request(app)
      .get('/api/users/admin/list')
      .set('Authorization', `Bearer ${adminAccessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('forbids customer from accessing /api/users/admin/list', async () => {
    const res = await request(app)
      .get('/api/users/admin/list')
      .set('Authorization', `Bearer ${customerAccessToken}`);
    expect(res.status).toBe(403);
  });
});