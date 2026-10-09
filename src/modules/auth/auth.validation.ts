import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  phone: z.string({ required_error: 'Phone is required' }).min(1, 'Phone is required'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  // Public signup always creates a customer. Staff/admin accounts
  // are created by an admin via POST /api/auth/users.
  role: z.enum(['customer']).optional(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    phone: z.string().min(1, 'Phone cannot be empty').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(6, 'New password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required' }).min(1, 'Reset token is required'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(6, 'New password must be at least 6 characters'),
});

export const createUserSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  phone: z.string({ required_error: 'Phone is required' }).min(1, 'Phone is required'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'staff', 'admin']).default('customer'),
});

export const updateRoleSchema = z.object({
  role: z.enum(['customer', 'staff', 'admin'], { required_error: 'Role is required' }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
