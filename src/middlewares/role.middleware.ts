import { Request, Response, NextFunction } from 'express';
import { Role } from '../config/roles.js';

export const roleMiddleware = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !user.role || !user.role.some(role => allowedRoles.includes(role as Role))) {
            return res.status(403).json({
                message: 'Forbidden: You do not have the required role',
                success: false
            });
        }

        next();
    };
};
