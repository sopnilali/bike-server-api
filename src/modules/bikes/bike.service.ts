import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { CreateBikeInput } from './bike.validation';

export const createBike = async (data: CreateBikeInput) => {
  const customer = await prisma.customer.findUnique({
    where: { customerId: data.customerId },
  });
  if (!customer) {
    throw new AppError(404, 'Customer not found');
  }
  return prisma.bike.create({ data });
};

export const getAllBikes = async () => {
  return prisma.bike.findMany({
    include: { customer: true },
    orderBy: { bikeId: 'asc' },
  });
};

export const getBikeById = async (id: string) => {
  const bike = await prisma.bike.findUnique({
    where: { bikeId: id },
    include: { customer: true },
  });
  if (!bike) {
    throw new AppError(404, 'Bike not found');
  }
  return bike;
};
