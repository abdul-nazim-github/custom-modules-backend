import { IPermission } from '../models/adv.permission.model.js';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/adv.permission.dto.js';
import mongoose from 'mongoose';
import { PermissionRepository } from '../repositories/adv.permission.repository.js';

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
     */
    private normalizePermissions(permissions: string[]): string[] {
        if (permissions.includes('*')) {
            return ['*'];
        }

        const finalPermissions = new Set<string>();

        for (const permission of permissions) {
            finalPermissions.add(permission);

            const parts = permission.split('.');
            const action = parts.pop();
            const modulePath = parts.join('.');

            if (action && action !== 'view') {
                finalPermissions.add(`${modulePath}.view`);
            }
        }

        return Array.from(finalPermissions);
    }
}