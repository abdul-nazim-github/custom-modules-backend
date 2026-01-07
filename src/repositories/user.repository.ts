import { UserModel } from '../models/user.model.js';
import { Types } from 'mongoose';

export class UserRepository {

    async findByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    async findById(userId: Types.ObjectId) {
        return UserModel.findById(userId);
    }

    async create(data: {
        email: string;
        password?: string;
        name?: string;
        metadata?: Record<string, any>;
    }) {
        return UserModel.create(data);
    }
}
