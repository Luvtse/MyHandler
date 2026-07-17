import { z } from 'zod';
import { VALIDATION } from '@/config/constants';

// Common validation patterns
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: VALIDATION.PHONE_REGEX,
  password: new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{${VALIDATION.MIN_PASSWORD_LENGTH},${VALIDATION.MAX_PASSWORD_LENGTH}}$`
  ),
  zipCode: /^\d{5}(-\d{4})?$/,
  url: /^https?:\/\/[\w\-]+([.\w\-]+)+[/#?]?.*$/,
};

// Base schemas for common fields
export const baseSchemas = {
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z
    .string()
    .min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
    .max(VALIDATION.MAX_PASSWORD_LENGTH, `Password cannot exceed ${VALIDATION.MAX_PASSWORD_LENGTH} characters`)
    .regex(
      patterns.password,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  phone: z
    .string()
    .regex(patterns.phone, 'Invalid phone number')
    .optional(),
  zipCode: z
    .string()
    .regex(patterns.zipCode, 'Invalid ZIP code')
    .optional(),
  url: z
    .string()
    .regex(patterns.url, 'Invalid URL')
    .optional(),
};

// Validation schemas for different forms
export const authSchemas = {
  login: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  register: z.object({
    email: baseSchemas.email,
    password: baseSchemas.password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: baseSchemas.phone,
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  resetPassword: z.object({
    email: baseSchemas.email,
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: baseSchemas.password,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  }),
};

export const addressSchemas = {
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: baseSchemas.zipCode,
    country: z.string().min(1, 'Country is required'),
    phone: baseSchemas.phone,
    isDefault: z.boolean().optional(),
    label: z.string().optional(),
  }),
};

export const shipmentSchemas = {
  createShipment: z.object({
    senderAddress: addressSchemas.address,
    recipientAddress: addressSchemas.address,
    packageDetails: z.object({
      weight: z.number().min(0.1, 'Weight must be greater than 0'),
      length: z.number().min(0.1, 'Length must be greater than 0'),
      width: z.number().min(0.1, 'Width must be greater than 0'),
      height: z.number().min(0.1, 'Height must be greater than 0'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    }),
    serviceType: z.enum(['express', 'standard', 'economy']),
    paymentMethod: z.enum(['prepaid', 'collect', 'account']),
    specialInstructions: z.string().optional(),
    insuranceRequired: z.boolean().optional(),
    estimatedValue: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.insuranceRequired && !data.estimatedValue) {
        return false;
      }
      return true;
    },
    {
      message: 'Estimated value is required when insurance is requested',
      path: ['estimatedValue'],
    }
  ),
};

// Async validation helpers
export const asyncValidators = {
  isEmailAvailable: async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return false;
    }
  },

  isValidAddress: async (address: typeof addressSchemas.address._type): Promise<boolean> => {
    try {
      const response = await fetch('/api/address/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  },
};

// Custom validation rules
export const customRules = {
  passwordStrength: (password: string): {
    valid: boolean;
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= VALIDATION.MIN_PASSWORD_LENGTH) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    // Common patterns check
    if (/123|abc|qwerty/i.test(password)) {
      score--;
      feedback.push('Avoid common patterns like 123, abc, qwerty');
    }

    // Repeated characters check
    if (/([a-zA-Z0-9!@#$%^&*])\1{2,}/.test(password)) {
      score--;
      feedback.push('Avoid repeating characters');
    }

    if (score < 3) feedback.push('Use a longer password with more variety');
    if (score < 4) feedback.push('Add uppercase letters, numbers, or symbols');

    return {
      valid: score >= 4,
      score,
      feedback,
    };
  },

  phoneNumberFormat: (phone: string, country = 'US'): boolean => {
    // Add more country-specific phone validation as needed
    const patterns: Record<string, RegExp> = {
      US: /^\+1[2-9]\d{9}$/,
      UK: /^\+44[1-9]\d{9}$/,
      // Add more country patterns here
    };

    return patterns[country]?.test(phone) ?? false;
  },
};