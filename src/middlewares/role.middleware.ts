import { Request, Response, NextFunction } from 'express';
import { Role } from '../config/roles.js';

export const roleMiddleware = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: 'Forbidden: User not authenticated',
                success: false
            });
        }

        const userRoles = user.role || [];
        const hasRole = Array.isArray(userRoles)
            ? userRoles.some(role => allowedRoles.includes(role as Role))
            : allowedRoles.includes(userRoles as Role);

        if (!hasRole) {
            return res.status(403).json({
                message: 'Forbidden: You do not have the required role',
                success: false
            });
        }

        next();
    };
};
