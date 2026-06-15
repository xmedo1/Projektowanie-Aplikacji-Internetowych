import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email({ error: 'Invalid email format' }),
  password: z
    .string({ error: 'Password is required' })
    .min(8, { error: 'Password must be at least 8 characters long' }),
  firstName: z
    .string({ error: 'First name is required' })
    .min(2, { error: 'First name must be at least 2 characters long' }),
});

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email format' }),
  password: z.string({ error: 'Password is required' }).min(1, { error: 'Password is required' }),
});

export const reservationSchema = z.object({
  screeningId: z
    .number({ error: 'Screening ID must be a number' })
    .int({ error: 'Screening ID must be an integer' })
    .positive({ error: 'Screening ID must be positive' }),
  seatRow: z
    .string({ error: 'Seat row is required' })
    .min(1, { error: 'Seat row cannot be empty' }),
  seatNumber: z
    .number({ error: 'Seat number must be a number' })
    .int({ error: 'Seat number must be an integer' })
    .positive({ error: 'Seat number must be positive' }),
  ticketType: z.enum(['REGULAR', 'STUDENT'], {
    error: 'Invalid ticket type. Allowed: REGULAR, STUDENT',
  }),
});

export const updateProfileSchema = z.object({
  email: z.email({ error: 'Invalid email format' }).optional(),
  password: z.string().min(8, { error: 'Password must be at least 8 characters long' }).optional(),
  firstName: z
    .string({ error: 'First name must be a string' })
    .min(2, { error: 'First name must be at least 2 characters long' })
    .optional(),
});

export const paymentSchema = z.object({
  reservationId: z.number().int().positive(),
});
