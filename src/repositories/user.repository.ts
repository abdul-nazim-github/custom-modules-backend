import { UserModel } from '../models/user.model.js';

export class UserRepository {

    async findByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    async create(data: {
        email: string;
        password?: string;
        name?: string;
        role?: string[];
        permissions?: string[];
        metadata?: Record<string, any>;
    }) {
        return UserModel.create(data);
    }
}
