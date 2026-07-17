import { JwtPayload } from 'jsonwebtoken';

declare module 'jsonwebtoken' {
  // You can extend the JwtPayload here if needed
}

// Export custom types
export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  role?: string;
}

export type TokenValidationResult = {
  isValid: boolean;
  payload?: CustomJwtPayload;
  error?: string;
};