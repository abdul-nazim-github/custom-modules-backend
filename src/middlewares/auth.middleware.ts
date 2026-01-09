import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { Role, RolePermissions } from '../config/roles.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        permissions: string[];
      };
      sessionId?: string;
    }
  }
}

export const authMiddleware = (
  accessSecret: string,
  sessionRepository: SessionRepository,
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

      if (decoded.sessionId) {
        const session = await sessionRepository.findById(decoded.sessionId);
        if (!session || !session.isActive) {
          return res.status(401).json({
            message: 'Session is no longer active',
            success: false
          });
        }
      }

      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          message: 'User not found',
          success: false
        });
      }

      const userRole = (user.role as Role) || Role.USER;
      const rolePermissions = RolePermissions[userRole] || [];
      const userPermissions = user.permissions || [];
      const mergedPermissions = Array.from(new Set([...rolePermissions, ...userPermissions]));

      req.user = {
        id: decoded.userId,
        role: userRole,
        permissions: mergedPermissions
      };
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
