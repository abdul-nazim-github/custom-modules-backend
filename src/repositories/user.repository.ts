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
        name?: string;
        role?: string;
        permissions?: string[];
        metadata?: Record<string, any>;
    }) {
        return UserModel.create(data);
    }

    async updateRole(userId: string, role: string, permissions: string[]) {
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
        role?: string;
    }) {
        const query: any = { deleted_at: null };
        if (filters.role) {
            query.role = filters.role;
        }

        const skip = (filters.page - 1) * filters.limit;

        const [items, totalCount] = await Promise.all([
            UserModel.find(query)
                .skip(skip)
                .limit(filters.limit)
                .select('-password')
                .sort({ name: 1, created_at: -1 }) // Sort by name, then newest first
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
