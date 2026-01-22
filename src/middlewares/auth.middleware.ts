import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authMiddleware = (
  accessSecret: string,
  userRepository: UserRepository
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: 'Authorization header missing',
        success: false
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Invalid authorization format',
        success: false
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: 'Access token missing',
        success: false
      });
    }
    try {
      const decoded = jwt.verify(token, accessSecret) as any;

      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          message: 'User not found',
          success: false
        });
      }

      req.user = { id: decoded.userId };
      next();
    } catch (error: any) {
      return res.status(401).json({
        message:
          error.name === 'TokenExpiredError'
            ? 'Access token expired'
            : 'Invalid access token',
        success: false
      });
    }
  };
};

