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

  // Express 4 always yields plain strings for route parameters. The installed
  // @types/express-serve-static-core models `ParamsDictionary` values as
  // `string | string[]` (to support Express-5 wildcard params), which is a
  // false positive for this Express-4 app and produced ~67 TS2322 errors at
  // every `where: { id: req.params.id }`. Merging in a flat `string` index
  // signature narrows the effective member type to `string & string` = `string`
  // for all keys, without touching any call sites.
  interface ParamsDictionary {
    [key: string]: string;
  }
}