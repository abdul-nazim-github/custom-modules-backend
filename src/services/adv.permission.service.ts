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
        const config = await ConfigModel.findOne({ slug: 'adv-permission-defaults' });
        console.log('Default permission config:', config);
        const defaultPerms = config ? config.permissions : [];
        const requestedPerms = data.permissions || [];

        const seenInRequest = new Set<string>();
        for (const p of requestedPerms) {
            if (seenInRequest.has(p)) {
                throw new Error(`Duplicate permission '${p}' found in request`);
            }
            seenInRequest.add(p);
        }
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

        const permission = await this.permissionRepository.create(roleData);
        return this.formatPermissionResponse(permission);
    }

    async list(filters: {
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
    }): Promise<{ items: any[]; totalCount: number }> {
        const { items, totalCount } = await this.permissionRepository.findAll({
            page: filters.page || 1,
            limit: filters.limit || 10,
            search: filters.search,
            sort: filters.sort
        });

        return {
            items: items.map(p => this.formatPermissionResponse(p)),
            totalCount
        };
    }

    async getOne(id: string): Promise<any | null> {
        const permission = await this.permissionRepository.findById(id);
        return permission ? this.formatPermissionResponse(permission) : null;
    }

    private formatPermissionResponse(p: IPermission) {
        const obj = p.toObject ? p.toObject() : p;
        const user = obj.userId && typeof obj.userId === 'object' ? {
            id: obj.userId._id,
            name: obj.userId.name,
            email: obj.userId.email
        } : null;

        delete obj.userId;
        return {
            ...obj,
            user
        };
    }


    async update(id: string, data: UpdateRoleDto): Promise<any | null> {
        if (data.permissions) {
            data.permissions = this.normalizePermissions(data.permissions);
        }
        const updateData: any = { ...data };
        if (data.userId) {
            updateData.userId = new mongoose.Types.ObjectId(data.userId);
        }
        const permission = await this.permissionRepository.update(id, updateData);
        return permission ? this.formatPermissionResponse(permission) : null;
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
            if (!action || !validActions.includes(action)) {
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
        const defaultPerms = config ? config.permissions : [];
        console.log('Default permissions to assign:', defaultPerms);
        const finalPermissions = this.normalizePermissions([...defaultPerms, ...requestedPermissions]);
        console.log('Final permissions to assign:', finalPermissions);
        return this.permissionRepository.updatePermissions(userId, finalPermissions);
    }

}