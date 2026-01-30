import { IPermission } from '../models/adv.permission.model.js';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/adv.permission.dto.js';
import mongoose from 'mongoose';
import { PermissionRepository } from '../repositories/adv.permission.repository.js';
import { ACTIONS, isValidModulePath } from '../config/adv.permission.js';
import { ConfigModel } from '../models/default.permission.model.js';

export class PermissionService {
    private permissionRepository: PermissionRepository;
    constructor(permissionRepository: PermissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    async create(data: CreateRoleDto): Promise<IPermission> {
        // Fetch default permissions from DB
        const config = await ConfigModel.findOne({ slug: 'adv-permission-defaults' });
        const defaultPerms = config ? config.permissions : ['profile.*'];
        const requestedPerms = data.permissions || [];

        // 1. Check for internal duplicates in the request
        const seenInRequest = new Set<string>();
        for (const p of requestedPerms) {
            if (seenInRequest.has(p)) {
                throw new Error(`Duplicate permission '${p}' found in request`);
            }
            seenInRequest.add(p);
        }

        // 2. Check for redundancies between request and defaults
        for (const p of requestedPerms) {
            for (const dp of defaultPerms) {
                if (this.isCoveredBy(p, dp)) {
                    throw new Error(`Permission '${p}' is already covered by default permission '${dp}'`);
                }
            }
        }

        // Merge defaults with requested permissions
        const mergedPermissions = [...new Set([...defaultPerms, ...requestedPerms])];

        const permissions = this.normalizePermissions(mergedPermissions);
        const roleData: any = {
            permissions
        };
        if (data.userId) {
            roleData.userId = new mongoose.Types.ObjectId(data.userId);
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
            // Optional: You might want to check redundancies here too against current record or defaults
            // But for now, just normalize
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
                throw new Error(`Bad Request: Invalid permission: ${permission}`);
            }
            finalPermissions.add(permission);
            if (action !== 'view' && action !== '*') {
                finalPermissions.add(`${modulePath}.view`);
            }
        }

        // Clean up redundancies (if profile.* exists, remove profile.view)
        const sorted = Array.from(finalPermissions).sort((a, b) => b.length - a.length);
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

    async assignDefaultPermissions(userId: string, requestedPermissions: string[]) {
        const config = await ConfigModel.findOne({ slug: 'adv-permission-defaults' });
        console.log('Default permission config:', config);
        const defaultPerms = config ? config.permissions : ['profile.*'];
        console.log('Default permissions to assign:', defaultPerms);
        const finalPermissions = this.normalizePermissions([...defaultPerms, ...requestedPermissions]);
        console.log('Final permissions to assign:', finalPermissions);
        return this.permissionRepository.updatePermissions(userId, finalPermissions);
    }

}