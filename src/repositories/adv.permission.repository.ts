import { AdvPermissionModel, IAdvPermission } from '../models/adv.permission.model.js';

export class PermissionRepository {
    async create(data: Partial<IAdvPermission>) {
        return AdvPermissionModel.create(data);
    }

    async findAll(filters: { search?: string; page?: number; limit?: number }) {
        const query: any = {};
        if (filters.search) {
            query.name = { $regex: filters.search, $options: 'i' };
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const [items, totalCount] = await Promise.all([
            AdvPermissionModel.find(query).skip(skip).limit(limit).exec(),
            AdvPermissionModel.countDocuments(query)
        ]);

        return { items, totalCount };
    }

    async findById(id: string) {
        return AdvPermissionModel.findById(id);
    }

    async findByName(name: string) {
        return AdvPermissionModel.findOne({ name });
    }

    async update(id: string, data: Partial<IAdvPermission>) {
        return AdvPermissionModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string) {
        return AdvPermissionModel.findByIdAndDelete(id);
    }
}
