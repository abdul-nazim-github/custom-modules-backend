import { IPermission, PermissionModel } from '../models/adv.permission.model.js';

export class PermissionRepository {
    async create(data: any): Promise<IPermission> {
        const permission = new PermissionModel(data);
        const saved = await permission.save();
        return (await PermissionModel.findById(saved._id).populate('userId', 'name email')) as IPermission;
    }

    async findAll(): Promise<IPermission[]> {
        return await PermissionModel.find().populate('userId', 'name email').sort({ created_at: -1 });
    }

    async findById(id: string): Promise<IPermission | null> {
        return await PermissionModel.findById(id).populate('userId', 'name email');
    }

    async update(id: string, data: any): Promise<IPermission | null> {
        return await PermissionModel.findByIdAndUpdate(id, data, { new: true }).populate('userId', 'name email');
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
