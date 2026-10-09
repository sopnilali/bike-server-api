import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import AppError from '../utils/AppError';
import { verifyAuthToken, UserRole } from '../utils/jwt';

export type { UserRole };

export interface AuthenticatedCustomer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedCustomer;
}

const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError(401, 'Unauthorized. Bearer token missing.');
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new AppError(401, 'Unauthorized. Token missing.');
    }

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      throw new AppError(401, 'Unauthorized. Invalid or expired token.');
    }

    const customer = await prisma.customer.findUnique({
      where: { customerId: payload.customerId },
      select: {
        customerId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new AppError(401, 'Unauthorized. Customer no longer exists.');
    }

    req.user = customer as AuthenticatedCustomer;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Require one of the given roles.
 * Must be used after `authenticate`.
 * Example: router.get('/', authenticate, authorize('staff', 'admin'), handler)
 */
export const authorize = (...allowed: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized'));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden. You do not have access to this resource.'));
    }
    next();
  };
};

export default authenticate;
