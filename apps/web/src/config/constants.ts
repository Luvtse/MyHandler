// Application-wide constants

import { canonicalToPrismaSnake, normalizeStatusId } from "@/lib/tracking-utils";

export const APP_CONFIG = {
  name: 'GoodsHandler',
  version: '1.0.0',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'fr', 'es'],
  defaultCurrency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  defaultPageSize: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
};

export const SHIPMENT_STATUS = {
  normalizeStatusId: normalizeStatusId,
} as const;

export const PAYMENT_METHODS = {
  PREPAID: 'prepaid',
  COLLECT: 'collect',
  ACCOUNT: 'account',
} as const;

export const SERVICE_TYPES = {
  EXPRESS: 'express',
  STANDARD: 'standard',
  ECONOMY: 'economy',
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 32,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TRACKING_NUMBER_REGEX: /^[A-Z0-9]{10,15}$/,
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired, please login again',
  NETWORK_ERROR: 'Network error occurred, please try again',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'Server error occurred, please try again later',
} as const;