import { IPermission, PermissionModel } from '../models/adv.permission.model.js';

export class PermissionRepository {
    async create(data: any): Promise<IPermission> {
        const permission = new PermissionModel(data);
        const saved = await permission.save();
        return (await PermissionModel.findById(saved._id).populate('userId', 'name email')) as IPermission;
    }

    async findAll(filters: {
        page: number;
        limit: number;
        search?: string;
        sort?: string;
    }): Promise<{ items: any[]; totalCount: number }> {
        const skip = (filters.page - 1) * filters.limit;

        const pipeline: any[] = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
        ];

        const match: any = {};
        if (filters.search) {
            match.$or = [
                { 'user.name': { $regex: filters.search, $options: 'i' } },
                { 'user.email': { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        let sortObj: any = { created_at: -1 };
        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const fieldMap: any = {
                'date': 'created_at',
                'created_at': 'created_at',
                'updated_at': 'updated_at',
                'name': 'user.name'
            };
            const sortField = fieldMap[field] || field;
            sortObj = { [sortField]: order === 'desc' ? -1 : 1 };
        }

        pipeline.push({ $sort: sortObj });

        const [items, total] = await Promise.all([
            PermissionModel.aggregate([
                ...pipeline,
                { $skip: skip },
                { $limit: filters.limit },
                {
                    $project: {
                        _id: 1,
                        permissions: 1,
                        created_at: 1,
                        updated_at: 1,
                        userId: '$user._id',
                        user: {
                            _id: '$user._id',
                            name: '$user.name',
                            email: '$user.email'
                        }
                    }
                }
            ]).exec(),
            PermissionModel.aggregate([
                ...pipeline,
                { $count: 'count' }
            ]).exec()
        ]);

        return {
            items,
            totalCount: total[0]?.count || 0
        };
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