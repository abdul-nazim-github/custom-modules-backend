import { Request, Response, NextFunction } from 'express';
import { Role, Permission, RolePermissions } from '../config/roles.js';

export const permissionMiddleware = (requiredPermission: Permission) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(403).json({
                message: 'Forbidden: User not authenticated',
                success: false
            });
        }
        const permissions = user.permissions || [];
        if (!permissions.includes(requiredPermission)) {
            return res.status(403).json({
                message: 'Forbidden: You do not have the required permission',
                success: false
            });
        }

        next();
    };
};
