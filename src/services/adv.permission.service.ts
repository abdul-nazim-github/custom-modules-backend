import { PermissionRepository } from '../repositories/adv.permission.repository.js';
import { MODULES, ACTIONS } from '../config/roles.js';

export class PermissionService {
    private permissionRepository: PermissionRepository;

    constructor(permissionRepository: PermissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    async create(data: { name: string; permissions?: string[]; metadata?: Record<string, any> }) {
        const existing = await this.permissionRepository.findByName(data.name);
        console.log('Existing role check:', existing);
        if (existing) {
            throw new Error('Role with this name already exists');
        }
        return this.permissionRepository.create(data);
    }

    async list(filters: { search?: string; page?: number; limit?: number }) {
        return this.permissionRepository.findAll(filters);
    }

    async getOne(id: string) {
        const role = await this.permissionRepository.findById(id);
        if (!role) {
            throw new Error('Role not found');
        }
        return role;
    }

    async update(id: string, data: { name?: string; permissions?: string[]; metadata?: Record<string, any> }) {
        if (data.name) {
            const existing = await this.permissionRepository.findByName(data.name);
            if (existing && existing._id.toString() !== id) {
                throw new Error('Role with this name already exists');
            }
        }
        const updated = await this.permissionRepository.update(id, data);
        if (!updated) {
            throw new Error('Role not found');
        }
        return updated;
    }

    async delete(id: string) {
        const deleted = await this.permissionRepository.delete(id);
        if (!deleted) {
            throw new Error('Role not found');
        }
        return deleted;
    }

    async getMatrix() {
        // Return all possible module-action combinations for the UI matrix
        const matrix: string[] = [];

        const traverse = (obj: any, prefix = '') => {
            for (const key in obj) {
                const module = obj[key];
                const path = prefix ? `${prefix}.${module.key}` : module.key;

                // Add actions for this module
                for (const actionKey in ACTIONS) {
                    matrix.push(`${path}.${(ACTIONS as any)[actionKey]}`);
                }

                if (module.submodules && Object.keys(module.submodules).length > 0) {
                    traverse(module.submodules, path);
                }
            }
        };

        traverse(MODULES);
        return matrix;
    }
}
