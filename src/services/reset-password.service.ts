import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository.js';

export class ResetPasswordService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async changePassword(payload: {
        userId: string;
        newPassword: string;
    }) {
        const user = await this.userRepository.findById(payload.userId as any);
        if (!user || user.deleted_at) {
            throw new Error('User not found');
        }

        const hashedPassword = await bcrypt.hash(payload.newPassword, 12);
        await this.userRepository.updatePassword(payload.userId, hashedPassword);

        return {
            message: 'Password changed successfully'
        };
    }
}
