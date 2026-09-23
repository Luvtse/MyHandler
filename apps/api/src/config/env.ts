import * as dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

/**
 * Fail-fast environment validation. Required secrets must be present in every
 * non-test environment — there is intentionally NO insecure fallback (the old
 * 'change_me' default allowed anyone to forge JWTs when the var was missing).
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// In tests only, allow a fixed dev secret so suites can run without a .env.
const jwtSecret = isTest
  ? process.env.JWT_SECRET || 'test-only-insecure-jwt-secret'
  : requireEnv('JWT_SECRET');

if (!isTest && jwtSecret === 'change_me') {
  throw new Error('JWT_SECRET is set to the insecure default "change_me". Rotate it before starting.');
}

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret,
  nodeEnv: process.env.NODE_ENV || 'development',
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:8080',
};