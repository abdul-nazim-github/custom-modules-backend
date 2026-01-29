import { IPermission, PermissionModel } from '../models/adv.permission.model.js';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/adv.permission.dto.js';

export class PermissionService {
    async create(data: CreateRoleDto): Promise<IPermission> {
        const permissions = this.normalizePermissions(data.permissions);

        const role = new PermissionModel({
            name: data.name,
            userId: data.userId,
            permissions
        });

        return role.save();
    }

    async list(): Promise<IPermission[]> {
        return PermissionModel.find().sort({ created_at: -1 });
    }

    async getOne(id: string): Promise<IPermission | null> {
        return PermissionModel.findById(id);
    }

    async update(id: string, data: UpdateRoleDto): Promise<IPermission | null> {
        if (data.permissions) {
            data.permissions = this.normalizePermissions(data.permissions);
        }

        return PermissionModel.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }

    async delete(id: string): Promise<IPermission | null> {
        return PermissionModel.findByIdAndDelete(id);
    }


    /**
     * Rule:
     * - SUPER_ADMIN → "*"
     * - If CREATE / EDIT / DELETE exists → VIEW must exist
     */
    private normalizePermissions(permissions: string[]): string[] {
        if (permissions.includes('*')) {
            return ['*'];
        }

        const finalPermissions = new Set<string>();

        for (const permission of permissions) {
            finalPermissions.add(permission);

            const [module, action] = permission.split(':');

            // Any non-view action requires view
            if (action !== 'view') {
                finalPermissions.add(`${module}:view`);
            }
        }

        return Array.from(finalPermissions);
    }
}