"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthRouter = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const jwt_1 = require("../utils/jwt");
const authService_1 = require("../services/authService");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
// Build the canonical JWT payload shape { sub, email, role } shared by the
// password login (authService) and OAuth callbacks. `role` is read from the
// DB at token-issuance time because OAuth-provisioned users default to
// `customer` in the schema but may hold an admin/finance secondary role.
async function buildTokenPayload(user) {
    const roles = await (0, authService_1.getSecondaryRoles)(user.id);
    const role = user.role && user.role !== 'customer'
        ? user.role
        : (roles.includes('admin') ? 'admin' : (user.role || 'customer'));
    return { sub: user.id, email: user.email, role };
}
// GitHub authentication
router.get('/github', passport_1.default.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport_1.default.authenticate('github', { failureRedirect: '/login', session: false }), async (req, res) => {
    const user = req.user;
    const accessToken = (0, jwt_1.generateToken)(await buildTokenPayload(user));
    const redirectUrl = `${env_1.env.clientUrl}/login?accessToken=${encodeURIComponent(accessToken)}`;
    res.redirect(redirectUrl);
});
// Google authentication
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login', session: false }), async (req, res) => {
    const user = req.user;
    const accessToken = (0, jwt_1.generateToken)(await buildTokenPayload(user));
    const redirectUrl = `${env_1.env.clientUrl}/login?accessToken=${encodeURIComponent(accessToken)}`;
    res.redirect(redirectUrl);
});
exports.oauthRouter = router;
