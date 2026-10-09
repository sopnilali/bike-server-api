import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/AppError';
import * as customerService from './customer.service';
import { createCustomerSchema, updateCustomerSchema, uuidParamSchema } from './customer.validation';
import { AuthRequest } from '../../middlewares/auth';

const ensureSelfOrStaff = (req: AuthRequest, id: string) => {
  if (!req.user) throw new AppError(401, 'Unauthorized');
  const isSelf = req.user.customerId === id;
  const isPrivileged = req.user.role === 'staff' || req.user.role === 'admin';
  if (!isSelf && !isPrivileged) {
    throw new AppError(403, 'Forbidden. You can only access your own profile.');
  }
};

export const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const data = createCustomerSchema.parse(req.body);
  const customer = await customerService.createCustomer(data);
  res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: customer,
  });
});

export const getAllCustomers = catchAsync(async (_req: Request, res: Response) => {
  const customers = await customerService.getAllCustomers();
  res.status(200).json({
    success: true,
    message: 'Customers fetched successfully',
    data: customers,
  });
});

export const getCustomerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = uuidParamSchema.parse(req.params);
  ensureSelfOrStaff(req as AuthRequest, id);
  const customer = await customerService.getCustomerById(id);
  res.status(200).json({
    success: true,
    message: 'Customer fetched successfully',
    data: customer,
  });
});

export const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = uuidParamSchema.parse(req.params);
  ensureSelfOrStaff(req as AuthRequest, id);
  const data = updateCustomerSchema.parse(req.body);
  const customer = await customerService.updateCustomer(id, data);
  res.status(200).json({
    success: true,
    message: 'Customer updated successfully',
    data: customer,
  });
});

export const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = uuidParamSchema.parse(req.params);
  await customerService.deleteCustomer(id);
  res.status(200).json({
    success: true,
    message: 'Customer deleted successfully',
    data: null,
  });
});
