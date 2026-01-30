import { IPermission, PermissionModel } from '../models/adv.permission.model.js';

export class PermissionRepository {
    async create(data: any): Promise<IPermission> {
        const permission = new PermissionModel(data);
        return await permission.save();
    }

    async findAll(): Promise<IPermission[]> {
        return await PermissionModel.find().sort({ created_at: -1 });
    }

    async findById(id: string): Promise<IPermission | null> {
        return await PermissionModel.findById(id);
    }

    async update(id: string, data: any): Promise<IPermission | null> {
        return await PermissionModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<IPermission | null> {
        return await PermissionModel.findByIdAndDelete(id);
    }
     async updatePermissions(userId: string, permissions: string[]) {
            return PermissionModel.findByIdAndUpdate(
                userId,
                { permissions },
                { new: true }
            );
        }
}
