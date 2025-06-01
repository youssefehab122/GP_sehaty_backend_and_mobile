import { body, validationResult } from 'express-validator';

export const validatePassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character')
    .custom((value) => {
      // Check for common passwords
      const commonPasswords = [
        'password123',
        '12345678',
        'qwerty123',
        'admin123',
        'welcome123',
      ];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('This password is too common. Please choose a stronger password.');
      }
      return true;
    })
    .custom((value) => {
      // Check for sequential characters
      const sequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i;
      if (sequential.test(value)) {
        throw new Error('Password contains sequential characters. Please choose a stronger password.');
      }
      return true;
    })
    .custom((value) => {
      // Check for repeated characters
      const repeated = /(.)\1{2,}/;
      if (repeated.test(value)) {
        throw new Error('Password contains too many repeated characters. Please choose a stronger password.');
      }
      return true;
    }),
];

export const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
]; 