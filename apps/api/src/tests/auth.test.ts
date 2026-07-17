import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { PrismaClient } from '@prisma/client';

const app = createApp();
const prisma = new PrismaClient();

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

describe('Auth API Integration Tests', () => {
  // Clean up test data before and after tests
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe('Registration and Login', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });

  describe('Token Refresh and Versioning', () => {
    let refreshToken: string;
    let accessToken: string;

    // Login to get initial tokens
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      refreshToken = res.body.refreshToken;
      accessToken = res.body.accessToken;
    });

    it('should refresh tokens successfully', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should invalidate refresh tokens on logout', async () => {
      // Logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(logoutRes.status).toBe(200);
      
      // Try to use the refresh token again - should fail
      const refreshAfterLogoutRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      
      expect(refreshAfterLogoutRes.status).toBe(401);
    });
  });
});