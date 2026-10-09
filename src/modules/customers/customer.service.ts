import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.validation';

export const createCustomer = async (data: CreateCustomerInput) => {
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, 'Email already exists');
  }
  return prisma.customer.create({ data });
};

export const getAllCustomers = async () => {
  return prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
};

export const getCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({ where: { customerId: id } });
  if (!customer) {
    throw new AppError(404, 'Customer not found');
  }
  return customer;
};

export const updateCustomer = async (id: string, data: UpdateCustomerInput) => {
  await getCustomerById(id);

  if (data.email) {
    const existing = await prisma.customer.findUnique({ where: { email: data.email } });
    if (existing && existing.customerId !== id) {
      throw new AppError(409, 'Email already exists');
    }
  }

  return prisma.customer.update({
    where: { customerId: id },
    data,
  });
};

export const deleteCustomer = async (id: string) => {
  await getCustomerById(id);

  const bikes = await prisma.bike.findMany({
    where: { customerId: id },
    select: { bikeId: true },
  });
  const bikeIds = bikes.map((b) => b.bikeId);

  await prisma.$transaction([
    prisma.serviceRecord.deleteMany({ where: { bikeId: { in: bikeIds } } }),
    prisma.bike.deleteMany({ where: { customerId: id } }),
    prisma.customer.delete({ where: { customerId: id } }),
  ]);
  return null;
};
