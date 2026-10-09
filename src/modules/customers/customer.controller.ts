import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import * as customerService from './customer.service';
import { createCustomerSchema, updateCustomerSchema, uuidParamSchema } from './customer.validation';

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
  const customer = await customerService.getCustomerById(id);
  res.status(200).json({
    success: true,
    message: 'Customer fetched successfully',
    data: customer,
  });
});

export const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = uuidParamSchema.parse(req.params);
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
