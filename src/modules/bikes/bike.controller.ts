import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/AppError';
import * as bikeService from './bike.service';
import { createBikeSchema, uuidParamSchema } from './bike.validation';
import { AuthRequest } from '../../middlewares/auth';

export const createBike = catchAsync(async (req: Request, res: Response) => {
  const data = createBikeSchema.parse(req.body);
  const user = (req as AuthRequest).user;
  if (!user) throw new AppError(401, 'Unauthorized');
  // Customers can only add bikes for themselves. Staff/admin can add for anyone.
  if (user.role === 'customer' && data.customerId !== user.customerId) {
    throw new AppError(403, 'Forbidden. Customers can only add bikes to their own account.');
  }
  const bike = await bikeService.createBike(data);
  res.status(201).json({
    success: true,
    message: 'Bike added successfully',
    data: bike,
  });
});

export const getAllBikes = catchAsync(async (_req: Request, res: Response) => {
  const bikes = await bikeService.getAllBikes();
  res.status(200).json({
    success: true,
    message: 'Bikes fetched successfully',
    data: bikes,
  });
});

export const getBikeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = uuidParamSchema.parse(req.params);
  const bike = await bikeService.getBikeById(id);
  res.status(200).json({
    success: true,
    message: 'Bike fetched successfully',
    data: bike,
  });
});
