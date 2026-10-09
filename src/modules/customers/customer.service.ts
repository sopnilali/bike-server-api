import crypto from 'crypto';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { hashPassword } from '../../utils/password';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.validation';

const publicSelect = {
  customerId: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const createCustomer = async (data: CreateCustomerInput) => {
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, 'Email already exists');
  }
  // Password optional here for backward compatibility (e.g. admin-created
  // records). Auth signup always supplies one. Fall back to an unusable
  // random value so the NOT NULL column is satisfied.
  const password = data.password
    ? await hashPassword(data.password)
    : await hashPassword(crypto.randomBytes(32).toString('hex'));
  return prisma.customer.create({
    data: { name: data.name, email: data.email, phone: data.phone, password },
    select: publicSelect,
  });
};

export const getAllCustomers = async () => {
  return prisma.customer.findMany({ orderBy: { createdAt: 'desc' }, select: publicSelect });
};

export const getCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { customerId: id },
    select: publicSelect,
  });
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

  const { password, ...rest } = data;
  return prisma.customer.update({
    where: { customerId: id },
    data: password ? { ...rest, password: await hashPassword(password) } : rest,
    select: publicSelect,
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
