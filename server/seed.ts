import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  householdName: z.string().min(2),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const eventSchema = z.object({
  title: z.string().min(1),
  dateTime: z.string().min(1),
  location: z.string().optional().or(z.literal('')),
  participants: z.string().optional().or(z.literal('')),
  transportation: z.string().optional().or(z.literal('')),
  preparation: z.string().optional().or(z.literal('')),
  travelTimeMinutes: z.number().min(0).optional(),
  reminderMinutes: z.number().min(0).optional(),
  recurrence: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  dueDate: z.string().optional().or(z.literal('')),
  recurrence: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  completed: z.boolean().optional(),
});

export const childSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional().or(z.literal('')),
  gradeLevel: z.string().optional().or(z.literal('')),
  careNotes: z.string().optional().or(z.literal('')),
});

export const schoolSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  contactName: z.string().optional().or(z.literal('')),
  contactEmail: z.string().optional().or(z.literal('')),
});

export const responsibilitySchema = z.object({
  title: z.string().min(1),
  dueDate: z.string().optional().or(z.literal('')),
  status: z.string().optional().default('open'),
  notes: z.string().optional().or(z.literal('')),
});
