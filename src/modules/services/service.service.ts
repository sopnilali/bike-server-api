import { ServiceRecord } from '@prisma/client';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { CreateServiceInput } from './service.validation';

type PrismaStatus = 'pending' | 'in_progress' | 'done';

// Convert Prisma "in_progress" back to API "in-progress" for responses.
export const toApiResponse = (record: ServiceRecord) => ({
  ...record,
  status: record.status === 'in_progress' ? 'in-progress' : record.status,
});

export const createService = async (data: CreateServiceInput) => {
  const bike = await prisma.bike.findUnique({ where: { bikeId: data.bikeId } });
  if (!bike) {
    throw new AppError(404, 'Bike not found');
  }

  const status = data.status as PrismaStatus;
  const isDone = status === 'done';

  const record = await prisma.serviceRecord.create({
    data: {
      bikeId: data.bikeId,
      serviceDate: data.serviceDate,
      description: data.description,
      status,
      completionDate: isDone ? data.completionDate ?? new Date() : null,
    },
  });

  return toApiResponse(record);
};

export const getAllServices = async () => {
  const records = await prisma.serviceRecord.findMany({
    include: { bike: true },
    orderBy: { serviceDate: 'desc' },
  });
  return records.map(toApiResponse);
};

export const getServiceById = async (id: string) => {
  const record = await prisma.serviceRecord.findUnique({
    where: { serviceId: id },
    include: { bike: true },
  });
  if (!record) {
    throw new AppError(404, 'Service record not found');
  }
  return toApiResponse(record as ServiceRecord);
};

export const completeService = async (id: string, completionDate?: Date) => {
  const existing = await prisma.serviceRecord.findUnique({
    where: { serviceId: id },
  });
  if (!existing) {
    throw new AppError(404, 'Service record not found');
  }
  if (existing.status === 'done') {
    throw new AppError(400, 'Service is already completed');
  }

  const record = await prisma.serviceRecord.update({
    where: { serviceId: id },
    data: {
      status: 'done',
      completionDate: completionDate ?? new Date(),
    },
  });

  return toApiResponse(record);
};

export const getOverdueServices = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const records = await prisma.serviceRecord.findMany({
    where: {
      status: { in: ['pending', 'in_progress'] },
      serviceDate: { lt: sevenDaysAgo },
    },
    include: { bike: true },
    orderBy: { serviceDate: 'asc' },
  });

  return records.map(toApiResponse);
};
