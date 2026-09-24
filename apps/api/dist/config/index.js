"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSecret = requireSecret;
const env_1 = require("./env");
const isTest = env_1.env.nodeEnv === 'test' || Boolean(process.env.VITEST);
/**
 * Return a required secret or fail fast. Payment processor credentials must
 * never silently fall back to hardcoded test keys — previously the processors
 * shipped defaults like 'CHAPASECRET_TEST_KEY' / 'sk_test_placeholder', which
 * meant misconfigured deployments "worked" while sending traffic with bogus
 * (or worse, shared public test) credentials.
 */
function requireSecret(name) {
    const value = process.env[name];
    if (!value) {
        if (isTest)
            return `test-placeholder-${name}`;
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
const config = {
    env: env_1.env,
    stripe: {
        secretKey: requireSecret('STRIPE_SECRET_KEY'),
    },
    paypal: {
        clientId: requireSecret('PAYPAL_CLIENT_ID'),
        clientSecret: requireSecret('PAYPAL_CLIENT_SECRET'),
        sandbox: process.env.PAYPAL_SANDBOX !== 'false',
    },
    chapa: {
        secretKey: requireSecret('CHAPA_SECRET_KEY'),
    },
    telebirr: {
        appId: requireSecret('TELEBIRR_APP_ID'),
        appKey: requireSecret('TELEBIRR_APP_KEY'),
        publicKey: requireSecret('TELEBIRR_PUBLIC_KEY'),
    },
    cbe: {
        merchantId: requireSecret('CBE_MERCHANT_ID'),
        apiKey: requireSecret('CBE_API_KEY'),
    },
};
exports.default = config;
