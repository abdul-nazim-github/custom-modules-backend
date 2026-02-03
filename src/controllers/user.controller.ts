import { Request, Response } from 'express';
import { RoleService } from '../services/role.service.js';
import { UserModel } from '../models/user.model.js';

export class UserController {
    constructor(private roleService: RoleService) { }

    /**
     * Creates a new user with permissions merged from their role and any custom overrides.
     */
    create = async (req: Request, res: Response) => {
        try {
            const { role, custom_permissions, email } = req.body;

            const finalPermissions = await this.roleService.resolveUserPermissions(role, custom_permissions || []);

            const user = await UserModel.create({
                email,
                role,
                permissions: finalPermissions
            });

            res.status(201).json({ message: 'User created successfully', success: true, data: user });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };

    /**
     * Updates a user's role and/or custom permissions, recalculating the final permission set.
     */
    syncAccess = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { role, custom_permissions } = req.body;

            const finalPermissions = await this.roleService.resolveUserPermissions(role, custom_permissions || []);

            const updated = await UserModel.findByIdAndUpdate(id, {
                role,
                permissions: finalPermissions
            }, { new: true });

            res.status(200).json({ message: 'User access updated', success: true, data: updated });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };

    /**
     * Assigns a role and custom permissions to a user identified by their email.
     */
    assignAccessByEmail = async (req: Request, res: Response) => {
        try {
            const { email, role, custom_permissions } = req.body;

            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found', success: false });
            }

            const finalPermissions = await this.roleService.resolveUserPermissions(role, custom_permissions || []);

            user.role = role as any;
            user.permissions = finalPermissions;
            await user.save();

            res.status(200).json({
                message: 'User access assigned successfully',
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message, success: false });
        }
    };
}
