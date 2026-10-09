import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/AppError';
import * as authService from './auth.service';
import { uploadProfilePhoto as uploadPhotoToS3, deleteProfilePhotoByUrl } from '../../utils/upload';
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createUserSchema,
  updateRoleSchema,
} from './auth.validation';
import { AuthRequest } from '../../middlewares/auth';

const requireUserId = (req: AuthRequest): string => {
  if (!req.user) throw new AppError(401, 'Unauthorized');
  return req.user.customerId;
};

export const signup = catchAsync(async (req: Request, res: Response) => {
  const data = signupSchema.parse(req.body);
  const { customer, token } = await authService.signup(data);
  res.status(201).json({
    success: true,
    message: 'Signup successful',
    data: { customer, token },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const { customer, token } = await authService.login(data);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { customer, token },
  });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const customerId = requireUserId(req as AuthRequest);
  const customer = await authService.getProfile(customerId);
  res.status(200).json({
    success: true,
    message: 'Profile fetched successfully',
    data: customer,
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const customerId = requireUserId(req as AuthRequest);
  const data = updateProfileSchema.parse(req.body);
  const customer = await authService.updateProfile(customerId, data);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: customer,
  });
});

export const uploadProfilePhoto = catchAsync(async (req: Request, res: Response) => {
  const customerId = requireUserId(req as AuthRequest);
  const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
  if (!file) {
    throw new AppError(400, 'Profile photo is required. Send multipart/form-data with field "photo".');
  }
  const photoUrl = await uploadPhotoToS3(customerId, file);
  try {
    const customer = await authService.updateProfilePhoto(customerId, photoUrl);
    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: customer,
    });
  } catch (err) {
    // Don't orphan the uploaded object if the DB update fails.
    await deleteProfilePhotoByUrl(photoUrl);
    throw err;
  }
});

export const removeProfilePhoto = catchAsync(async (req: Request, res: Response) => {
  const customerId = requireUserId(req as AuthRequest);
  const customer = await authService.removeProfilePhoto(customerId);
  res.status(200).json({
    success: true,
    message: 'Profile photo removed successfully',
    data: customer,
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const customerId = requireUserId(req as AuthRequest);
  const data = changePasswordSchema.parse(req.body);
  await authService.changePassword(customerId, data);
  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const { resetToken, expiresAt } = await authService.forgotPassword(email);
  res.status(200).json({
    success: true,
    message: 'Password reset token generated. Use it within 1 hour.',
    data: { resetToken, expiresAt },
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const data = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(data);
  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please login with your new password.',
    data: null,
  });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const data = createUserSchema.parse(req.body);
  const customer = await authService.createUser(data);
  res.status(201).json({
    success: true,
    message: `User with role '${data.role}' created successfully`,
    data: customer,
  });
});

export const updateRole = catchAsync(async (req: Request, res: Response) => {
  const { role } = updateRoleSchema.parse(req.body);
  const customerId = (req.params as { id: string }).id;
  const customer = await authService.updateRole(customerId, role);
  res.status(200).json({
    success: true,
    message: `Role updated to '${role}' successfully`,
    data: customer,
  });
});
