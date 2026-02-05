import { Request, Response } from 'express';
import { RoleService } from '../services/role.service.js';


export class RoleController {
    constructor(private roleService: RoleService) { }

    create = async (req: Request, res: Response) => {
        try {
            const role = await this.roleService.createRole(req.body);
            const { updated_at, ...data } = role.toObject();
            res.status(201).json({ message: 'Role created', success: true, data });
        } catch (error: any) {
            const statusCode = error.message.includes('already exists') ? 409 : 500;
            res.status(statusCode).json({ message: error.message, success: false });
        }
    };

    list = async (req: Request, res: Response) => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const search = req.query.search as string;

            // Handle both unified 'sort' and legacy 'sortBy'/'order'
            let sort = req.query.sort as string;
            const sortBy = req.query.sortBy as string;
            const order = req.query.order as string;

            if (!sort && sortBy) {
                sort = `${sortBy}:${order || 'asc'}`;
            }

            const { items, totalCount } = await this.roleService.listRoles({
                page,
                limit,
                search,
                sort
            });

            const from = (page - 1) * limit + 1;
            const to = from + items.length - 1;

            res.status(200).json({
                success: true,
                data: items,
                meta: {
                    totalCount,
                    from: items.length > 0 ? from : 0,
                    to: items.length > 0 ? to : 0
                }
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const role = await this.roleService.updateRole(req.params.id as string, req.body);
            if (!role) {
                return res.status(404).json({ message: 'Role not found', success: false });
            }
            res.status(200).json({ message: 'Role updated', success: true, data: role });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            await this.roleService.deleteRole(req.params.id as string);
            res.status(200).json({ message: 'Role deleted', success: true });
        } catch (error: any) {
            let statusCode = 500;
            if (error.message.includes('not found') || error.message.includes('already deleted')) {
                statusCode = 404;
            } else if (error.message.includes('assigned to')) {
                statusCode = 400;
            }
            res.status(statusCode).json({ message: error.message, success: false });
        }
    };
}
