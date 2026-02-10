import { z } from 'zod';

// Base schema fields (without password)
const baseStationAdminSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  name: z
    .string()
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  station: z
    .string()
    .min(1, 'Please select a station'),
  isActive: z
    .boolean()
    .optional()
    .default(true),
});

// Schema for create (password required)
export const createStationAdminSchema = baseStationAdminSchema.extend({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

// Schema for edit (password optional)
export const editStationAdminSchema = baseStationAdminSchema.extend({
  password: z
    .string()
    .optional()
    .refine((val) => {
      // If password is provided, it must be at least 6 characters
      // If empty string or undefined, it's valid (optional)
      return !val || val.length === 0 || val.length >= 6;
    }, {
      message: 'Password must be at least 6 characters if provided',
    }),
});

// Base schema for type inference (used when password handling is done separately)
export const stationAdminSchema = baseStationAdminSchema.extend({
  password: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type StationAdminFormData = z.infer<typeof stationAdminSchema>;
export type CreateStationAdminFormData = z.infer<typeof createStationAdminSchema>;
export type EditStationAdminFormData = z.infer<typeof editStationAdminSchema>;

export interface StationAdmin {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  name?: string;
  station: string;
  stationId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

