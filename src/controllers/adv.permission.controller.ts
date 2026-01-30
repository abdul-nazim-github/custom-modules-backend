import { Request, Response } from 'express';
import { PermissionService } from '../services/adv.permission.service.js';
import { MODULES, ACTIONS, generateMatrix } from '../config/adv.permission.js';

export class PermissionController {
    private permissionService: PermissionService;

    constructor(permissionService: PermissionService) {
        this.permissionService = permissionService;
    }

    create = async (req: Request, res: Response) => {
        try {
            const permission = await this.permissionService.create(req.body);
            res.status(201).json({
                message: 'Permission created successfully',
                success: true,
                data: permission
            });
        } catch (error: any) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                return res.status(400).json({
                    message: `A permission with this ${field} already exists`,
                    success: false
                });
            }
            res.status(500).json({
                message: error.message || 'Internal server error',
                success: false
            });
        }
    };

    list = async (_req: Request, res: Response) => {
        try {
            const permissions = await this.permissionService.list();
            res.status(200).json({
                message: 'Permissions fetched successfully',
                success: true,
                data: permissions
            });
        } catch (error: any) {
            res.status(500).json({
                message: error.message || 'Internal server error',
                success: false
            });
        }
    };

    getOne = async (req: Request, res: Response) => {
        try {
            const permission = await this.permissionService.getOne(req.params.id as string);

            if (!permission) {
                return res.status(404).json({
                    message: 'Permission not found',
                    success: false
                });
            }

            res.status(200).json({
                message: 'Permission fetched successfully',
                success: true,
                data: permission
            });
        } catch (error: any) {
            res.status(500).json({
                message: error.message || 'Internal server error',
                success: false
            });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const permission = await this.permissionService.update(req.params.id as string, req.body);

            if (!permission) {
                return res.status(404).json({
                    message: 'Permission not found',
                    success: false
                });
            }

            res.status(200).json({
                message: 'Permission updated successfully',
                success: true,
                data: permission
            });
        } catch (error: any) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                return res.status(400).json({
                    message: `A permission with this ${field} already exists`,
                    success: false
                });
            }
            res.status(500).json({
                message: error.message || 'Internal server error',
                success: false
            });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const permission = await this.permissionService.delete(req.params.id as string);

            if (!permission) {
                return res.status(404).json({
                    message: 'Permission not found',
                    success: false
                });
            }

            res.status(200).json({
                message: 'Permission deleted successfully',
                success: true
            });
        } catch (error: any) {
            res.status(500).json({
                message: error.message || 'Internal server error',
                success: false
            });
        }
    };

    /**
     * Permission matrix for frontend
     */
    getMatrix = async (_req: Request, res: Response) => {
        res.status(200).json({
            message: 'Permission matrix fetched successfully',
            success: true,
            data: {
                modules: Object.values(MODULES).map(m => m.key),
                actions: Object.values(ACTIONS),
                permissions: generateMatrix()
            }
        });
    };
}
