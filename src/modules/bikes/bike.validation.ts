import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const createBikeSchema = z.object({
  brand: z.string({ required_error: 'Brand is required' }).min(1, 'Brand is required'),
  model: z.string({ required_error: 'Model is required' }).min(1, 'Model is required'),
  year: z
    .number({ required_error: 'Year is required', invalid_type_error: 'Year must be a number' })
    .int('Year must be an integer')
    .min(1900, 'Year must be 1900 or later')
    .max(currentYear + 1, `Year cannot be greater than ${currentYear + 1}`),
  customerId: z.string({ required_error: 'customerId is required' }).uuid('Invalid customerId. Must be a valid UUID.'),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format. Must be a valid UUID.'),
});

export type CreateBikeInput = z.infer<typeof createBikeSchema>;
