import { UserModel } from '../models/user.model.js';
import { Types } from 'mongoose';

export class UserRepository {

    async findByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    async findById(userId: Types.ObjectId) {
        return UserModel.findOne({ _id: userId, deleted_at: null });
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
}
