import { z } from 'zod';

export const bookingSchema = z.object({
  client: z
    .string()
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must not exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid customer email address')
    .max(150, 'Email must not exceed 150 characters'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid customer phone number (at least 7 digits)')
    .max(25, 'Phone number must not exceed 25 characters'),
  eventType: z
    .string()
    .trim()
    .min(2, 'Please specify the event type')
    .max(80, 'Event type must not exceed 80 characters'),
  date: z
    .string()
    .min(1, 'Please select the event date'),
  city: z
    .string()
    .trim()
    .min(2, 'Event city / location must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),
  venue: z
    .string()
    .trim()
    .max(150, 'Venue must not exceed 150 characters')
    .optional()
    .or(z.literal('')),
  budget: z
    .string()
    .trim()
    .max(80, 'Budget description must not exceed 80 characters')
    .default('₹1,50,000'),
  requirements: z
    .string()
    .trim()
    .max(1000, 'Requirements notes must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
});

export const passwordSchema = z
  .string()
  .min(4, 'Password must be at least 4 characters long')
  .max(128, 'Password cannot exceed 128 characters');

export const authLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const authSignupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must not exceed 80 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const trackInputSchema = z.object({
  title: z.string().trim().min(2, 'Track title must be at least 2 characters').max(120),
  category: z.string().trim().min(2).max(50),
  duration: z.string().trim().min(1).max(20).default('3:45'),
  bpm: z.number().int().min(40).max(250).default(120),
  key: z.string().trim().max(10).default('C min'),
  description: z.string().trim().max(500).optional(),
});

export const eventInputSchema = z.object({
  title: z.string().trim().min(2, 'Event title must be at least 2 characters').max(120),
  venue: z.string().trim().min(2, 'Venue is required').max(120),
  city: z.string().trim().min(2, 'City is required').max(100),
  month: z.string().trim().max(10),
  day: z.string().trim().max(10),
  time: z.string().trim().max(30).default('8:00 PM IST'),
  type: z.string().trim().max(50).default('Live Performance'),
});

export const profileInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  stageName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(200),
  bioParagraph1: z.string().trim().max(3000),
  bioParagraph2: z.string().trim().max(3000),
  email: z.string().trim().email(),
  notificationEmail: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().max(30),
  location: z.string().trim().max(100),
  managerName: z.string().trim().max(100),
});
