import crypto from 'crypto';
import multer from 'multer';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, s3Bucket, s3PublicBaseUrl } from '../config/storage';
import AppError from './AppError';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const extensionFor = (mime: string): string => {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
};

// Memory storage: file stays in RAM, we stream it to S3 ourselves.
export const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new AppError(400, 'Only JPEG, PNG, or WebP images are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const uploadProfilePhoto = async (
  customerId: string,
  file: Express.Multer.File,
): Promise<string> => {
  const key = `profile/${customerId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extensionFor(file.mimetype)}`;
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: s3Bucket(),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    }),
  );
  return `${s3PublicBaseUrl()}/${key}`;
};

export const keyFromProfileUrl = (url: string): string | null => {
  const prefix = `${s3PublicBaseUrl()}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
};

export const deleteProfilePhotoByUrl = async (url: string | null): Promise<void> => {
  if (!url) return;
  const key = keyFromProfileUrl(url);
  if (!key) return;
  try {
    await getS3Client().send(new DeleteObjectCommand({ Bucket: s3Bucket(), Key: key }));
  } catch {
    // Old photo cleanup must never fail the profile update.
  }
};
