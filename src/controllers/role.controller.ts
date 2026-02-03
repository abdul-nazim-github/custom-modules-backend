import { Request, Response } from 'express';
import { RoleService } from '../services/role.service.js';

export class RoleController {
    constructor(private roleService: RoleService) { }

    create = async (req: Request, res: Response) => {
        try {
            const role = await this.roleService.createRole(req.body);
            res.status(201).json({ message: 'Role created', success: true, data: role });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };

    list = async (_req: Request, res: Response) => {
        try {
            const roles = await this.roleService.listRoles();
            res.status(200).json({ success: true, data: roles });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const role = await this.roleService.updateRole(req.params.id, req.body);
            res.status(200).json({ message: 'Role updated', success: true, data: role });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            await this.roleService.deleteRole(req.params.id);
            res.status(200).json({ message: 'Role deleted', success: true });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };
}
