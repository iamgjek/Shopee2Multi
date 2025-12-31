import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    plan: string;
    role?: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as { id: string; email: string; plan: string; role?: string };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

// Admin authentication middleware
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  authenticate(req, res, () => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    if (req.user.role !== 'admin') {
      return next(new AppError('Admin access required', 403));
    }
    
    next();
  });
};
