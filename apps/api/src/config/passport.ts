import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { env } from './env';

const prisma = new PrismaClient();

// GitHub Strategy (conditionally enabled)
if (env.githubClientId && env.githubClientSecret) {
  passport.use(new GitHubStrategy({
      clientID: env.githubClientId,
      clientSecret: env.githubClientSecret,
      callbackURL: '/api/oauth/github/callback'
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
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
      } catch (error) {
        return done(error);
      }
    }
  ));
} else {
  console.warn('Passport GitHub OAuth disabled: missing GITHUB_CLIENT_ID/SECRET');
}

// Google Strategy (conditionally enabled)
if (env.googleClientId && env.googleClientSecret) {
  passport.use(new GoogleStrategy({
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: '/api/oauth/google/callback'
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
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
      } catch (error) {
        return done(error);
      }
    }
  ));
} else {
  console.warn('Passport Google OAuth disabled: missing GOOGLE_CLIENT_ID/SECRET');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
