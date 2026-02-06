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
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const role = req.query.role as string;
            const search = req.query.search as string;

            // Handle both unified 'sort' and legacy 'sortBy'/'order'
            let sort = req.query.sort as string;
            const sortBy = req.query.sortBy as string;
            const order = req.query.order as string;

            if (!sort && sortBy) {
                sort = `${sortBy}:${order || 'asc'}`;
            }

            const result = await this.authService.listUsers({
                page,
                limit,
                role: role ? [role] : undefined,
                search,
                sort
            });
            const from = (page - 1) * limit + 1;
            const to = from + result.data.length - 1;
            return res.status(200).json({
                data: result.data,
                meta: {
                    totalCount: result.totalCount,
                    from: result.data.length > 0 ? from : 0,
                    to: result.data.length > 0 ? to : 0,
                },
                message: result.message,
                success: true
            });

        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public deleteUser = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const deletedBy = req.user?.id;

            if (!deletedBy) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.authService.deleteUser({
                userId: userId as string,
                deletedBy
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
