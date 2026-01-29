import { Request, Response, NextFunction } from 'express';
import { Role } from '../config/roles.js';
import { PermissionModel } from '../models/adv.permission.model.js';

export const granularPermissionMiddleware = (requiredPermission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(403).json({
                message: 'Forbidden: User not authenticated',
                success: false
            });
        }
        if (user.role === Role.SUPER_ADMIN) {
            return next();
        }
        let permissionDoc = await PermissionModel.findOne({ userId: user.id });
        if (!permissionDoc) {
            return res.status(403).json({
                message: 'Forbidden: No permissions found for this user or role',
                success: false
            });
        }

        // if (!permissionDoc.permissions.includes(requiredPermission)) {
        //     return res.status(403).json({
        //         message: 'Forbidden: Missing required permission',
        //         success: false
        //     });
        // }
        const hasPermission =
            permissionDoc.permissions.includes('*') ||
            permissionDoc.permissions.includes(requiredPermission) ||
            permissionDoc.permissions.includes(
                requiredPermission.split('.').slice(0, -1).join('.') + '.*'
            );

        if (!hasPermission) {
            return res.status(403).json({
                message: 'Forbidden: Missing required permission',
                success: false
            });
        }
        next();
    };
};