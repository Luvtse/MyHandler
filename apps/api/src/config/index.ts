import { env } from './env';

const config = {
  env,
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    sandbox: process.env.PAYPAL_SANDBOX !== 'false',
  },
  chapa: {
    secretKey: process.env.CHAPA_SECRET_KEY || '',
  },
  telebirr: {
    appId: process.env.TELEBIRR_APP_ID || '',
    appKey: process.env.TELEBIRR_APP_KEY || '',
    publicKey: process.env.TELEBIRR_PUBLIC_KEY || '',
  },
  cbe: {
    merchantId: process.env.CBE_MERCHANT_ID || '',
    apiKey: process.env.CBE_API_KEY || '',
  },
};

export default config;