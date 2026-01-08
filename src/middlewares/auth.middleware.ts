import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { SessionRepository } from '../repositories/session.repository.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
      sessionId?: string;
    }
  }
}

export const authMiddleware = (
  accessSecret: string,
  sessionRepository: SessionRepository
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

      if (decoded.sessionId) {
        const session = await sessionRepository.findById(decoded.sessionId);
        if (!session || !session.isActive) {
          return res.status(401).json({
            message: 'Session is no longer active',
            success: false
          });
        }
      }

      req.user = { id: decoded.userId };
      req.sessionId = decoded.sessionId;

      next();
    } catch {
      return res.status(401).json({
        message: 'Invalid or expired access token',
        success: false
      });
    }
  };
};
