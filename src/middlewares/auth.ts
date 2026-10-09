import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import AppError from '../utils/AppError';
import { verifyAuthToken } from '../utils/jwt';

export interface AuthenticatedCustomer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
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
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new AppError(401, 'Unauthorized. Customer no longer exists.');
    }

    req.user = customer;
    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;
