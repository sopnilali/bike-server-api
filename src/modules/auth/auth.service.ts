import crypto from 'crypto';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAuthToken } from '../../utils/jwt';
import { deleteProfilePhotoByUrl } from '../../utils/upload';
import {
  SignupInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from './auth.validation';

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Never leak password hashes or reset tokens in API responses.
const publicSelect = {
  customerId: true,
  name: true,
  email: true,
  phone: true,
  profileImage: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const signup = async (data: SignupInput) => {
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, 'Email already exists');
  }
  const password = await hashPassword(data.password);
  const customer = await prisma.customer.create({
    data: { name: data.name, email: data.email, phone: data.phone, password },
    select: publicSelect,
  });
  const token = signAuthToken({ customerId: customer.customerId, email: customer.email });
  return { customer, token };
};

export const login = async (data: LoginInput) => {
  const customer = await prisma.customer.findUnique({ where: { email: data.email } });
  if (!customer) {
    throw new AppError(401, 'Invalid email or password');
  }
  const ok = await comparePassword(data.password, customer.password);
  if (!ok) {
    throw new AppError(401, 'Invalid email or password');
  }
  const token = signAuthToken({ customerId: customer.customerId, email: customer.email });
  const { password: _pw, passwordResetToken: _t, passwordResetExpires: _e, ...safe } = customer;
  return { customer: safe, token };
};

export const getProfile = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { customerId },
    select: publicSelect,
  });
  if (!customer) {
    throw new AppError(404, 'Customer not found');
  }
  return customer;
};

export const updateProfile = async (customerId: string, data: UpdateProfileInput) => {
  await getProfile(customerId);
  return prisma.customer.update({
    where: { customerId },
    data,
    select: publicSelect,
  });
};

export const updateProfilePhoto = async (customerId: string, photoUrl: string) => {
  const existing = await prisma.customer.findUnique({ where: { customerId } });
  if (!existing) {
    throw new AppError(404, 'Customer not found');
  }
  const customer = await prisma.customer.update({
    where: { customerId },
    data: { profileImage: photoUrl },
    select: publicSelect,
  });
  // Remove the previous object from storage (fire-and-forget, never fails update).
  if (existing.profileImage && existing.profileImage !== photoUrl) {
    await deleteProfilePhotoByUrl(existing.profileImage);
  }
  return customer;
};

export const removeProfilePhoto = async (customerId: string) => {
  const existing = await prisma.customer.findUnique({ where: { customerId } });
  if (!existing) {
    throw new AppError(404, 'Customer not found');
  }
  if (!existing.profileImage) {
    throw new AppError(400, 'No profile photo to remove');
  }
  const customer = await prisma.customer.update({
    where: { customerId },
    data: { profileImage: null },
    select: publicSelect,
  });
  await deleteProfilePhotoByUrl(existing.profileImage);
  return customer;
};

export const changePassword = async (customerId: string, data: ChangePasswordInput) => {
  const customer = await prisma.customer.findUnique({ where: { customerId } });
  if (!customer) {
    throw new AppError(404, 'Customer not found');
  }
  const ok = await comparePassword(data.currentPassword, customer.password);
  if (!ok) {
    throw new AppError(400, 'Current password is incorrect');
  }
  const password = await hashPassword(data.newPassword);
  await prisma.customer.update({
    where: { customerId },
    data: { password, passwordResetToken: null, passwordResetExpires: null },
  });
  return null;
};

export const forgotPassword = async (email: string) => {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) {
    throw new AppError(404, 'No customer found with this email');
  }
  const resetToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await prisma.customer.update({
    where: { customerId: customer.customerId },
    data: { passwordResetToken: resetToken, passwordResetExpires },
  });
  return { resetToken, expiresAt: passwordResetExpires };
};

export const resetPassword = async (data: ResetPasswordInput) => {
  const customer = await prisma.customer.findUnique({
    where: { passwordResetToken: data.token },
  });
  if (!customer || !customer.passwordResetExpires || customer.passwordResetExpires < new Date()) {
    throw new AppError(400, 'Invalid or expired reset token');
  }
  const password = await hashPassword(data.newPassword);
  await prisma.customer.update({
    where: { customerId: customer.customerId },
    data: { password, passwordResetToken: null, passwordResetExpires: null },
  });
  return null;
};
