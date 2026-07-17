import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
        permissions?: string[];
        [key: string]: any;
      };
    }
  }
}

// Export the augmented Request type
export interface AuthenticatedRequest extends Express.Request {
  user: {
    id: string;
    role?: string;
    permissions?: string[];
    [key: string]: any;
  };
}