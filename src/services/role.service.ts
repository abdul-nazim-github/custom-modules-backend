import { RoleModel } from '../models/role.user.model.js';
import { RoleUserDto, UpdateRoleUserDto } from '../dtos/role.user.dto.js';
import { UserModel } from '../models/user.model.js';
import { ACTIONS, isValidModulePath } from '../config/roles.js';

export class RoleService {
    constructor() { }

    async createRole(data: RoleUserDto) {
        const existing = await this.getByName(data.name);
        if (existing) {
            throw new Error(`Role '${data.name}' already exists`);
        }
        if (data.permissions) {
            data.permissions = this.normalizePermissions(data.permissions);
        }
        return await RoleModel.create(data);
    }

    async listRoles(filters: {
        page: number;
        limit: number;
        search?: string;
        sort?: string;
    }) {
        const query: any = { deleted_at: null };
        if (filters.search) {
            query.name = { $regex: filters.search, $options: 'i' };
        }

        let sortObj: any = { name: 1 };
        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const fieldMap: any = { 'date': 'created_at', 'created_at': 'created_at', 'updated_at': 'updated_at' };
            const sortField = fieldMap[field] || field;
            sortObj = { [sortField]: order === 'desc' ? -1 : 1 };
        }

        const skip = (filters.page - 1) * filters.limit;

        const [items, totalCount] = await Promise.all([
            RoleModel.find(query).sort(sortObj).skip(skip).limit(filters.limit),
            RoleModel.countDocuments(query)
        ]);

        return { items, totalCount };
    }

    async getByName(name: string) {
        return await RoleModel.findOne({ name, deleted_at: null });
    }

    async updateRole(id: string, data: UpdateRoleUserDto) {
        if (data.permissions) {
            data.permissions = this.normalizePermissions(data.permissions);
        }
        return await RoleModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteRole(id: string) {
        // First, get the role to check its name and if it exists
        const role = await RoleModel.findOne({ _id: id, deleted_at: null });
        if (!role) {
            throw new Error('Role not found or already deleted');
        }

        // Prevent deletion of default roles
        if (role.is_default) {
            throw new Error(`Cannot delete default role '${role.name}'`);
        }

        const usersWithRole = await UserModel.countDocuments({
            role: role.name
        });

        if (usersWithRole > 0) {
            throw new Error(
                `Cannot delete role '${role.name}' because it is assigned to ${usersWithRole} user(s). Please reassign or remove these users before deleting the role.`
            );
        }
        return await RoleModel.findByIdAndUpdate(
            id,
            { deleted_at: new Date() },
            { new: true }
        );
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
        return this.normalizePermissions(combined);
    }

    /**
     * Checks if a permission is covered by another permission (redundant)
     */
    private isCoveredBy(child: string, parent: string): boolean {
        if (parent === '*') return true;
        if (parent === child) return true;
        if (parent.endsWith('.*')) {
            const prefix = parent.slice(0, -1);
            return child.startsWith(prefix);
        }
        return false;
    }

    /**
     * Normalize permissions: deduplicate, validate modules/actions, ensure .view if other actions exist.
     */
    public normalizePermissions(permissions: string[]): string[] {
        if (permissions.includes('*')) {
            return ['*'];
        }

        const finalPermissions = new Set<string>();
        const validActions = [...Object.values(ACTIONS), '*'];

        for (const permission of permissions) {
            const parts = permission.split('.');
            const action = parts.pop();
            const modulePath = parts.join('.');
            if (!action || !validActions.includes(action as any)) {
                throw new Error(`Invalid action "${action}" in permission "${permission}"`);
            }
            if (!modulePath || !isValidModulePath(modulePath)) {
                throw new Error(`Bad Request: Invalid module: ${modulePath}`);
            }
            finalPermissions.add(permission);
            if (action !== 'view' && action !== '*') {
                finalPermissions.add(`${modulePath}.view`);
            }
        }
        const result = new Set<string>();

        const finalArray = Array.from(finalPermissions);
        for (const p of finalArray) {
            const isRedundant = finalArray.some(other => other !== p && this.isCoveredBy(p, other));
            if (!isRedundant) {
                result.add(p);
            }
        }

        return Array.from(result);
    }
}
