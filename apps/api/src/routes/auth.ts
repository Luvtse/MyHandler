import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt';
import { getSecondaryRoles } from '../services/authService';
import { env } from '../config/env';

const router = Router();

// Build the canonical JWT payload shape { sub, email, role } shared by the
// password login (authService) and OAuth callbacks. `role` is read from the
// DB at token-issuance time because OAuth-provisioned users default to
// `customer` in the schema but may hold an admin/finance secondary role.
async function buildTokenPayload(user: { id: string; email: string; role?: string }) {
  const roles = await getSecondaryRoles(user.id);
  const role = user.role && user.role !== 'customer'
    ? user.role
    : (roles.includes('admin') ? 'admin' : (user.role || 'customer'));
  return { sub: user.id, email: user.email, role };
}

// GitHub authentication
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    const user = req.user as any;
    const accessToken = generateToken(await buildTokenPayload(user));
    const redirectUrl = `${env.clientUrl}/login?accessToken=${encodeURIComponent(accessToken)}`;
    res.redirect(redirectUrl);
  }
);

// Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    const user = req.user as any;
    const accessToken = generateToken(await buildTokenPayload(user));
    const redirectUrl = `${env.clientUrl}/login?accessToken=${encodeURIComponent(accessToken)}`;
    res.redirect(redirectUrl);
  }
);

export const oauthRouter = router;