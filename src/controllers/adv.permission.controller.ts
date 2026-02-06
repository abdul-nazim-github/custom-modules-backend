import { Request, Response } from 'express';
import { PermissionService } from '../services/adv.permission.service.js';

export class PermissionController {
    private permissionService: PermissionService;

    constructor(permissionService: PermissionService) {
        this.permissionService = permissionService;
    }

    public create = async (req: Request, res: Response) => {
        try {
            const result = await this.permissionService.create(req.body);
            res.status(201).json({
                message: 'Role created successfully',
                data: result,
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public list = async (req: Request, res: Response) => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const search = req.query.search as string;

            const { items, totalCount } = await this.permissionService.list({ page, limit, search });

            res.json({
                data: items,
                meta: {
                    totalCount,
                    page,
                    limit
                },
                message: 'Roles retrieved successfully',
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public getOne = async (req: Request, res: Response) => {
        try {
            const result = await this.permissionService.getOne(req.params.id);
            res.json({
                data: result,
                message: 'Role details retrieved successfully',
                success: true
            });
        } catch (error: any) {
            res.status(404).json({
                message: error.message,
                success: false
            });
        }
    };

    public update = async (req: Request, res: Response) => {
        try {
            const result = await this.permissionService.update(req.params.id, req.body);
            res.json({
                message: 'Role updated successfully',
                data: result,
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public delete = async (req: Request, res: Response) => {
        try {
            await this.permissionService.delete(req.params.id);
            res.json({
                message: 'Role deleted successfully',
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public getMatrix = async (req: Request, res: Response) => {
        try {
            const matrix = await this.permissionService.getMatrix();
            res.json({
                data: matrix,
                message: 'Permission matrix retrieved successfully',
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };
}
