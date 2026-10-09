import jwt from 'jsonwebtoken';

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not set');
    }
    return 'dev-secret-change-me';
  }
  return secret;
};

export type UserRole = 'customer' | 'staff' | 'admin';

export interface AuthTokenPayload {
  customerId: string;
  email: string;
  role: UserRole;
}

export const signAuthToken = (payload: AuthTokenPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt.sign as any)(payload, getSecret(), { expiresIn });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, getSecret()) as AuthTokenPayload;
};
