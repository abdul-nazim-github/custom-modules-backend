import { IPermission } from '../models/adv.permission.model.js';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/adv.permission.dto.js';
import mongoose from 'mongoose';
import { PermissionRepository } from '../repositories/adv.permission.repository.js';
import { MODULES, ACTIONS, isValidModulePath } from '../config/adv.permission.js';

export class PermissionService {
    private permissionRepository: PermissionRepository;

    constructor(permissionRepository: PermissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    async create(data: CreateRoleDto): Promise<IPermission> {
        const permissions = this.normalizePermissions(data.permissions);
        const roleData: any = {
            permissions
        };
        if (data.userId) {
            roleData.userId = data.userId;
        }
        if (data.name) {
            roleData.name = data.name;
        }

        return this.permissionRepository.create(roleData);
    }

    async list(): Promise<IPermission[]> {
        return this.permissionRepository.findAll();
    }

    async getOne(id: string): Promise<IPermission | null> {
        return this.permissionRepository.findById(id);
    }

    async update(id: string, data: UpdateRoleDto): Promise<IPermission | null> {
        if (data.permissions) {
            data.permissions = this.normalizePermissions(data.permissions);
        }
        const updateData: any = { ...data };
        if (data.userId) {
            updateData.userId = new mongoose.Types.ObjectId(data.userId);
        }
        return this.permissionRepository.update(id, updateData);
    }

    async delete(id: string): Promise<IPermission | null> {
        return this.permissionRepository.delete(id);
    }

    /**
     * Rule:
     * - SUPER_ADMIN → "*"
     * - If CREATE / EDIT / DELETE exists → VIEW must exist
     * - Module and Submodule must exist in config
     * - Action must be valid (view, create, edit, delete, *)
     */
    private normalizePermissions(permissions: string[]): string[] {
        if (permissions.includes('*')) {
            return ['*'];
        }

        const finalPermissions = new Set<string>();
        const validActions = [...Object.values(ACTIONS), '*'];

        for (const permission of permissions) {
            const parts = permission.split('.');
            const action = parts.pop();
            const modulePath = parts.join('.');
            if (!action || !validActions.includes(action)) {
                throw new Error(`Invalid action "${action}" in permission "${permission}"`);
            }
            if (!modulePath || !isValidModulePath(modulePath)) {
                throw new Error(`Invalid module path "${modulePath}" in permission "${permission}"`);
            }
            finalPermissions.add(permission);
            if (action !== 'view' && action !== '*') {
                finalPermissions.add(`${modulePath}.view`);
            }
        }

        return Array.from(finalPermissions);
    }
}