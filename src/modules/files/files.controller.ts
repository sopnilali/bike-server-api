import { Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/AppError';
import prisma from '../../config/prisma';
import { getS3Client, s3Bucket } from '../../config/storage';
import { keyFromProfileUrl } from '../../utils/upload';
import { uuidParamSchema } from '../customers/customer.validation';

// Streams a customer's profile photo from private S3 storage so it is
// viewable without exposing bucket credentials.
export const getProfilePhoto = catchAsync(async (req: Request, res: Response) => {
  const { id } = uuidParamSchema.parse(req.params);
  const customer = await prisma.customer.findUnique({ where: { customerId: id } });
  if (!customer || !customer.profileImage) {
    throw new AppError(404, 'Profile photo not found');
  }
  const key = keyFromProfileUrl(customer.profileImage);
  if (!key) {
    throw new AppError(404, 'Profile photo not found');
  }

  let object;
  try {
    object = await getS3Client().send(new GetObjectCommand({ Bucket: s3Bucket(), Key: key }));
  } catch {
    throw new AppError(404, 'Profile photo not found');
  }

  res.setHeader('Content-Type', object.ContentType || 'image/jpeg');
  if (object.ContentLength) res.setHeader('Content-Length', String(object.ContentLength));
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const body = object.Body as unknown as NodeJS.ReadableStream;
  body.pipe(res);
});
