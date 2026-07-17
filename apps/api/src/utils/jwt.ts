import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function generateToken(payload: object): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '1d' });
}