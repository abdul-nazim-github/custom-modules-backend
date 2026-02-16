import { UserModel } from '../models/user.model.js';
import { Types } from 'mongoose';

export class UserRepository {

    async findByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    async findById(userId: Types.ObjectId) {
        return UserModel.findOne({ _id: userId, deleted_at: null });
    }

    async create(data: {
        email: string;
        password?: string;
        first_name: string;
        last_name: string;
        role?: string[];
        permissions?: string[];
        metadata?: Record<string, any>;
    }) {
        return UserModel.create(data);
    }

    async updateRole(userId: string, role: string[], permissions: string[]) {
        return UserModel.findByIdAndUpdate(
            userId,
            { role, permissions },
            { new: true }
        );
    }

    async updatePermissions(userId: string, permissions: string[]) {
        return UserModel.findByIdAndUpdate(
            userId,
            { permissions },
            { new: true }
        );
    }

    async findAll(filters: {
        page: number;
        limit: number;
        role?: string[];
        search?: string;
        sort?: string;
    }) {
        const query: any = { deleted_at: null };
        if (filters.role) {
            query.role = filters.role;
        }
        if (filters.search) {
            query.$or = [
                { first_name: { $regex: filters.search, $options: 'i' } },
                { last_name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const skip = (filters.page - 1) * filters.limit;

        // Parse sort parameter (e.g., "name:asc")
        let sortObj: any = { created_at: -1 };
        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const fieldMap: any = { 'date': 'created_at', 'created_at': 'created_at', 'updated_at': 'updated_at' };
            const sortField = fieldMap[field] || field;
            sortObj = { [sortField]: order === 'desc' ? -1 : 1 };
        }

        const [items, totalCount] = await Promise.all([
            UserModel.find(query)
                .skip(skip)
                .limit(filters.limit)
                .select('-password')
                .sort(sortObj)
                .exec(),
            UserModel.countDocuments(query)
        ]);

        return { items, totalCount };
    }

    async updatePassword(userId: string, password: string) {
        return UserModel.findByIdAndUpdate(
            userId,
            { password },
            { new: true }
        );
    }

    async markResetTokenUsed(userId: string) {
        return UserModel.updateOne(
            { _id: userId, resetTokenUsedAt: { $exists: false } },
            { $set: { resetTokenUsedAt: new Date() } }
        );
    }

    async clearResetTokenUsed(userId: string) {
        return UserModel.findByIdAndUpdate(
            userId,
            { $unset: { resetTokenUsedAt: 1 } },
            { new: true }
        );
    }

    async delete(userId: string) {
        return UserModel.findByIdAndUpdate(
            userId,
            {
                deleted_at: new Date()
            },
            { new: true }
        );
    }
}
