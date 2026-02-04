import { Request, Response, NextFunction } from 'express';
import { Role, RolePermissions } from '../config/roles.js';

export const permissionMiddleware = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(403).json({
                message: 'Forbidden: User not authenticated',
                success: false
            });
        }
        if (user.role === Role.SUPER_ADMIN || user.role === 'super_admin') {
            return next();
        }
        const userPermissions = user.permissions || [];
        const hasPermission = userPermissions.some(p => {
            if (p === requiredPermission) return true;
            if (p === '*') return true;
            if (p.endsWith('.*')) {
                const prefix = p.slice(0, -2);
                return requiredPermission.startsWith(prefix + '.');
            }
            return false;
        });
        if (!hasPermission) {
            return res.status(403).json({
                message: `Forbidden: You do not have the required permission (${requiredPermission})`,
                success: false
            });
        }

        next();
    };
};
