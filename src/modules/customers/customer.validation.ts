import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  phone: z.string({ required_error: 'Phone is required' }).min(1, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['customer', 'staff', 'admin']).optional(),
});

export const updateCustomerSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone cannot be empty').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format. Must be a valid UUID.'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
