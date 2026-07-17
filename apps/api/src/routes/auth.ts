import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt';
import { env } from '../config/env';

const router = Router();

// GitHub authentication
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user as any;
    const accessToken = generateToken({ id: user.id });
    const redirectUrl = `${env.clientUrl}/login?accessToken=${encodeURIComponent(accessToken)}`;
    res.redirect(redirectUrl);
  }
);

// Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user as any;
    const accessToken = generateToken({ id: user.id });
    const redirectUrl = `${env.clientUrl}/login?accessToken=${encodeURIComponent(accessToken)}`;
    res.redirect(redirectUrl);
  }
);

export const oauthRouter = router;