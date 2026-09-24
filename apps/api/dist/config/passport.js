"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_github2_1 = require("passport-github2");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const client_1 = require("@prisma/client");
const env_1 = require("./env");
const prisma = new client_1.PrismaClient();
// GitHub Strategy (conditionally enabled)
if (env_1.env.githubClientId && env_1.env.githubClientSecret) {
    passport_1.default.use(new passport_github2_1.Strategy({
        clientID: env_1.env.githubClientId,
        clientSecret: env_1.env.githubClientSecret,
        callbackURL: '/api/oauth/github/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('GitHub email not public'), null);
            }
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name: profile.displayName || profile.username,
                        password: null,
                        phone: ''
                    }
                });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
}
else {
    console.warn('Passport GitHub OAuth disabled: missing GITHUB_CLIENT_ID/SECRET');
}
// Google Strategy (conditionally enabled)
if (env_1.env.googleClientId && env_1.env.googleClientSecret) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.googleClientId,
        clientSecret: env_1.env.googleClientSecret,
        callbackURL: '/api/oauth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('Google email not available'), null);
            }
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name: profile.displayName,
                        password: null,
                        phone: ''
                    }
                });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
}
else {
    console.warn('Passport Google OAuth disabled: missing GOOGLE_CLIENT_ID/SECRET');
}
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error);
    }
});
exports.default = passport_1.default;
