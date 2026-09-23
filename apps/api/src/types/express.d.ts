import 'express';

/**
 * Shape of `req.user` as populated by `requireAuth` (src/services/authService.ts).
 * It is the raw, verified JWT access-token payload signed in `buildAuthResponse`:
 *   { sub, email, role }
 * There is intentionally NO `id` field and NO `secondaryRoles` on this object.
 * Use `user.sub` for the user id. If secondary roles are needed, load them from
 * the database (`prisma.userSecondaryRole`) — never trust a client-held token claim.
 */
export interface AuthUser {
  /** User ID (Prisma `User.id`). This is the ONLY place the user id lives. */
  sub: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}