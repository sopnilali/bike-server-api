import { z } from 'zod';

// API accepts "in-progress" but Prisma enum value is "in_progress" (@map("in-progress")).
// We validate the API value, then transform to the Prisma value.
const apiStatusEnum = z.enum(['pending', 'in-progress', 'done'], {
  required_error: 'Status is required',
  invalid_type_error: 'Invalid service status',
});

export const createServiceSchema = z.object({
  bikeId: z.string({ required_error: 'bikeId is required' }).uuid('Invalid bikeId. Must be a valid UUID.'),
  serviceDate: z.coerce.date({ required_error: 'serviceDate is required', invalid_type_error: 'Invalid serviceDate' }),
  description: z.string({ required_error: 'Description is required' }).min(1, 'Description is required'),
  status: apiStatusEnum.default('pending').transform((v) => (v === 'in-progress' ? 'in_progress' : v)),
  completionDate: z.coerce.date().nullish(),
});

export const completeServiceSchema = z.object({
  completionDate: z.coerce.date().optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format. Must be a valid UUID.'),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CompleteServiceInput = z.infer<typeof completeServiceSchema>;
