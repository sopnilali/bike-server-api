import { S3Client } from '@aws-sdk/client-s3';

const required = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`${name} is not set. Configure S3-compatible object storage in .env.`);
  }
  return value;
};

export const s3Bucket = () => required(process.env.S3_BUCKET, 'S3_BUCKET');

export const s3PublicBaseUrl = (): string => {
  // Neon S3-compatible storage serves objects at <endpoint>/<bucket>/<key>.
  const endpoint = required(process.env.AWS_ENDPOINT_URL_S3, 'AWS_ENDPOINT_URL_S3').replace(/\/$/, '');
  return `${endpoint}/${s3Bucket()}`;
};

// Singleton S3 client (lazy so importing this module never throws at boot).
let client: S3Client | null = null;

export const getS3Client = (): S3Client => {
  if (client) return client;
  client = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-1',
    endpoint: required(process.env.AWS_ENDPOINT_URL_S3, 'AWS_ENDPOINT_URL_S3'),
    credentials: {
      accessKeyId: required(process.env.AWS_ACCESS_KEY_ID, 'AWS_ACCESS_KEY_ID'),
      secretAccessKey: required(process.env.AWS_SECRET_ACCESS_KEY, 'AWS_SECRET_ACCESS_KEY'),
    },
    forcePathStyle: true,
  });
  return client;
};
