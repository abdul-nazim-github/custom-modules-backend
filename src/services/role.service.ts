import { RoleModel } from '../models/role.user.model.js';
import { RoleUserDto, UpdateRoleUserDto } from '../dtos/role.user.dto.js';
import { PermissionService } from './adv.permission.service.js';

export class RoleService {
    constructor(private permissionService: PermissionService) { }

    async createRole(data: RoleUserDto) {
        const existing = await this.getByName(data.name);
        if (existing) {
            throw new Error(`Role '${data.name}' already exists`);
        }
        if (data.permissions) {
            data.permissions = this.permissionService.normalizePermissions(data.permissions);
        }
        return await RoleModel.create(data);
    }

    async listRoles() {
        return await RoleModel.find().sort({ name: 1 });
    }

    async getByName(name: string) {
        return await RoleModel.findOne({ name });
    }

    async updateRole(id: string, data: UpdateRoleUserDto) {
        if (data.permissions) {
            data.permissions = this.permissionService.normalizePermissions(data.permissions);
        }
        return await RoleModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteRole(id: string) {
        return await RoleModel.findByIdAndDelete(id);
    }

    /**
     * Resolves the final permission set for a user based on their role and any custom overrides.
     */
    async resolveUserPermissions(roleNames: string | string[], custom: string[] = []): Promise<string[]> {
        const roles = Array.isArray(roleNames) ? roleNames : [roleNames];
        if (roles.includes('super_admin')) return ['*'];

        let basePermissions: string[] = [];
        for (const roleName of roles) {
            const blueprint = await this.getByName(roleName);
            if (!blueprint) {
                throw new Error(`Invalid role: ${roleName}`);
            }
            if (blueprint.permissions) {
                basePermissions = [...basePermissions, ...blueprint.permissions];
            }
        }

        const combined = [...new Set([...basePermissions, ...custom])];
        return this.permissionService.normalizePermissions(combined);
    }
}
