import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { ContactRepository } from '../repositories/contact.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { Role, Permission } from '../config/roles.js';
import jwt from 'jsonwebtoken';

export const validateBody = (type: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const input = plainToInstance(type, req.body);
    const errors = await validate(input);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed. Please check your input.',
        success: false
      });
    }

    req.body = input;
    next();
  };
};
export const protectContactListing = (
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

      const user = await userRepository.findById(decoded.userId) as any;
      console.log('Decoded User ID:', decoded.userId);
      console.log('User from DB:', user);
      if (!user) {
        return res.status(401).json({
          message: 'User not found',
          success: false
        });
      }

      if (user.role && user.role.includes('super_admin')) {
        req.user = {
          id: user._id.toString(),
          role: user.role,
          permissions: user.permissions || []
        };
        return next();
      }

      const permissions = user.permissions || [];
      if (!permissions.includes(Permission.CONTACT_FORM)) {
        return res.status(403).json({
          message: 'Forbidden: You do not have the required permission',
          success: false
        });
      }

      req.user = {
        id: user._id.toString(),
        role: user.role,
        permissions: permissions
      };
      next();
    } catch (error: any) {
      return res.status(401).json({
        message: error.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token',
        success: false
      });
    }
  };
};

