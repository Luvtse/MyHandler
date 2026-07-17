// Unified authentication service for frontend and backend contexts

export interface Tokens {
  accessToken?: string;
  refreshToken?: string;
}

export interface UserRole {
  id: string;
  name: string;
}

export const ClientAuth = {
  getAccessToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      return localStorage.getItem('accessToken') || undefined;
    } catch {
      return undefined;
    }
  },

  getRefreshToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      return localStorage.getItem('refreshToken') || undefined;
    } catch {
      return undefined;
    }
  },

  setTokens(tokens: Tokens): void {
    if (typeof window === 'undefined') return;
    try {
      if (tokens.accessToken) localStorage.setItem('accessToken', tokens.accessToken);
      if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);
    } catch {}
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch {}
  },

  hasRole(userRoles: string[] | UserRole[] | undefined, required: string | string[]): boolean {
    if (!userRoles || userRoles.length === 0) return false;
    const requiredList = Array.isArray(required) ? required : [required];
    const names = userRoles.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
    return requiredList.some((role) => names.includes(role));
  },
};

export const ServerAuth = {
  async signAccessToken(payload: Record<string, any>, secret?: string, expiresIn = '12h'): Promise<string> {
    const jwt = await import('jsonwebtoken');
    const key = secret || process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'jwt_dev_secret';
    return jwt.default.sign(payload, key, { expiresIn: expiresIn as any });
  },
  async signRefreshToken(payload: Record<string, any>, secret?: string, expiresIn = '7d'): Promise<string> {
    const jwt = await import('jsonwebtoken');
    const key = secret || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'jwt_dev_secret';
    return jwt.default.sign(payload, key, { expiresIn: expiresIn as any });
  },
  async verifyToken<T = any>(token: string, secret?: string): Promise<T | null> {
    const jwt = await import('jsonwebtoken');
    const key = secret || process.env.JWT_ACCESS_SECRET || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'jwt_dev_secret';
    try {
      return jwt.default.verify(token, key) as T;
    } catch {
      return null;
    }
  },
};