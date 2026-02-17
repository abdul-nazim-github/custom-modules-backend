import { IPermission } from '../models/adv.permission.model.js';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/adv.permission.dto.js';
import mongoose from 'mongoose';
import { PermissionRepository } from '../repositories/adv.permission.repository.js';
import { ACTIONS, isValidModulePath } from '../config/adv.permission.js';
import { ConfigModel } from '../models/default.permission.model.js';
import { UserRepository } from '../repositories/user.repository.js';

export class PermissionService {
    private permissionRepository: PermissionRepository;
    private userRepository: UserRepository;

    constructor(
        permissionRepository: PermissionRepository,
        userRepository: UserRepository
    ) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    async create(data: CreateRoleDto): Promise<any> {
        const config = await ConfigModel.findOne({ slug: 'adv-permission-defaults' });
        console.log('Default permission config:', config);
        const defaultPerms = config ? config.permissions : [];
        const requestedPerms = data.permissions || [];

        // Check for duplicates in the request itself
        const seenInRequest = new Set<string>();
        for (const p of requestedPerms) {
            if (seenInRequest.has(p)) {
                throw new Error(`Duplicate permission '${p}' found in request`);
            }
            seenInRequest.add(p);
        }

        // Merge defaults with requested permissions - normalization handles redundancy silently
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

        // Sync with User model
        if (roleData.userId) {
            await this.userRepository.updatePermissions(roleData.userId.toString(), permissions);
        }

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
        let permission = await this.permissionRepository.findById(id);

        if (!permission && mongoose.Types.ObjectId.isValid(id)) {
            // Smart lookup: try by userId if not found by permissionId
            permission = await this.permissionRepository.findByUserId(id);
        }

        return permission ? this.formatPermissionResponse(permission) : null;
    }

    private formatPermissionResponse(p: any) {
        const obj = p.toObject ? p.toObject() : p;

        let user = null;

        // Case 1: Populated by Mongoose (userId is the user object)
        if (obj.userId && typeof obj.userId === 'object' && (obj.userId.first_name || obj.userId.email)) {
            user = {
                id: obj.userId._id,
                full_name: obj.userId.full_name || `${obj.userId.first_name || ''} ${obj.userId.last_name || ''}`.trim(),
                email: obj.userId.email
            };
        }
        // Case 2: From Aggregation (user object exists separately)
        else if (obj.user && typeof obj.user === 'object' && (obj.user.first_name || obj.user.email)) {
            user = {
                id: obj.user._id,
                full_name: `${obj.user.first_name || ''} ${obj.user.last_name || ''}`.trim(),
                email: obj.user.email
            };
        }
        delete obj.userId;
        delete obj.user;

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
        let permission = await this.permissionRepository.update(id, updateData);

        if (!permission && mongoose.Types.ObjectId.isValid(id)) {
            // Smart lookup: try finding by userId to get the real permission ID
            const existing = await this.permissionRepository.findByUserId(id);
            if (existing) {
                permission = await this.permissionRepository.update(existing._id.toString(), updateData);
            }
        }

        // Sync with User model
        if (permission && permission.userId && updateData.permissions) {
            const userId = typeof permission.userId === 'object' ? permission.userId._id.toString() : permission.userId.toString();
            await this.userRepository.updatePermissions(userId, updateData.permissions);
        }

        return permission ? this.formatPermissionResponse(permission) : null;
    }

    async delete(id: string): Promise<IPermission | null> {
        const permission = await this.permissionRepository.delete(id);

        // Sync with User model (clear permissions)
        if (permission && permission.userId) {
            const userId = typeof permission.userId === 'object' ? permission.userId._id.toString() : permission.userId.toString();
            await this.userRepository.updatePermissions(userId, []);
        }

        return permission;
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

        // Sync with User model
        await this.userRepository.updatePermissions(userId, finalPermissions);

        return this.permissionRepository.updatePermissions(userId, finalPermissions);
    }

    async syncPermissions(userId: string, permissions: string[]) {
        const finalPermissions = this.normalizePermissions(permissions);
        // Sync with User model
        await this.userRepository.updatePermissions(userId, finalPermissions);
        return this.permissionRepository.updatePermissions(userId, finalPermissions);
    }
}