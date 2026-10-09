import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import * as serviceService from './service.service';
import { completeServiceSchema, createServiceSchema, uuidParamSchema } from './service.validation';

export const createService = catchAsync(async (req: Request, res: Response) => {
  const data = createServiceSchema.parse(req.body);
  const record = await serviceService.createService(data);
  res.status(201).json({
    success: true,
    message: 'Service record created successfully',
    data: record,
  });
});

export const getAllServices = catchAsync(async (_req: Request, res: Response) => {
  const records = await serviceService.getAllServices();
  res.status(200).json({
    success: true,
    message: 'Service records fetched successfully',
    data: records,
  });
});

export const getOverdueServices = catchAsync(async (_req: Request, res: Response) => {
  const records = await serviceService.getOverdueServices();
  res.status(200).json({
    success: true,
    message: 'Overdue services fetched successfully',
    data: records,
  });
});

export const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = uuidParamSchema.parse(req.params);
  const record = await serviceService.getServiceById(id);
  res.status(200).json({
    success: true,
    message: 'Service record fetched successfully',
    data: record,
  });
});

export const completeService = catchAsync(async (req: Request, res: Response) => {
  const { id } = uuidParamSchema.parse(req.params);
  const { completionDate } = completeServiceSchema.parse(req.body ?? {});
  const record = await serviceService.completeService(id, completionDate);
  res.status(200).json({
    success: true,
    message: 'Service marked as completed',
    data: record,
  });
});
