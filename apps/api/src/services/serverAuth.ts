import * as jwt from 'jsonwebtoken';

export const ServerAuth = {
  async signAccessToken(payload: Record<string, any>, secret?: string, expiresIn: string | number = '12h'): Promise<string> {
    const key = secret || process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'jwt_dev_secret';
    return jwt.sign(payload, key, { expiresIn: expiresIn as any });
  },
  async signRefreshToken(payload: Record<string, any>, secret?: string, expiresIn: string | number = '7d'): Promise<string> {
    const key = secret || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'jwt_dev_secret';
    return jwt.sign(payload, key, { expiresIn: expiresIn as any });
  },
  async verifyToken<T = any>(token: string, secret?: string): Promise<T | null> {
    const key = secret || process.env.JWT_ACCESS_SECRET || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'jwt_dev_secret';
    try {
      return jwt.verify(token, key) as T;
    } catch {
      return null;
    }
  },
};