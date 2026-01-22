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
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'Authorization token missing',
          success: false
        });
      }

      const token = authHeader.split(' ')[1];

      const decoded = jwt.verify(token, accessSecret) as any;

      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          message: 'User not found',
          success: false
        });
      }

      req.user = {
        id: decoded.userId
      };

      next();
    } catch {
      return res.status(401).json({
        message: 'Invalid or expired access token',
        success: false
      });
    }
  };
};
