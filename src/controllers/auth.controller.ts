import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.js';
import { Role } from '../config/roles.js';
export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public updateUserRole = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const updatedBy = req.user?.id;

            if (!updatedBy) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.authService.updateUserRole({
                userId: userId as string,
                newRole: role,
                updatedBy
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public updateUserPermissions = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { permissions } = req.body;
            const updatedBy = req.user?.id;

            if (!updatedBy) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }
            const result = await this.authService.updateUserPermissions({
                userId: userId as string,
                permissions,
                updatedBy
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public listUsers = async (req: Request, res: Response) => {
        try {
            const { page, limit, role } = req.query;

            const result = await this.authService.listUsers({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                role: role as Role
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };
}
