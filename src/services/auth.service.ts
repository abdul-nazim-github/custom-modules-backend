import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { logger } from '../utils/logger.js';
import { sendResetEmail } from '../utils/email.util.js';

export class AuthService {
    private config: AuthConfig;
    private userRepository: UserRepository;

    constructor(
        config: AuthConfig,
        userRepository: UserRepository
    ) {
        this.config = config;
        this.userRepository = userRepository;
    }

    async forgotPassword(payload: { email: string }) {
        try {
            const user = await this.userRepository.findByEmail(payload.email);
            if (!user || user.deleted_at) {
                return {
                    message: 'User does not exist.',
                    success: false
                };
            }
            const resetToken = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    type: 'reset'
                },
                this.config.jwt.resetSecret,
                { expiresIn: this.config.jwt.resetTTL as any }
            );
            const resetLink = `${this.config.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(payload.email)}`;
            await sendResetEmail(this.config.email, payload.email, resetLink);
            await this.userRepository.clearResetTokenUsed(user._id.toString());
            return {
                message: 'Email has been sent.',
                success: true
            };
        } catch (error: any) {
            console.error("Error sending reset email:", error);
            return {
                message: "Failed to send reset email.",
                success: false
            };
        }
    }

    async resetPassword(payload: {
        token: string;
        password: string;
    }) {
        try {
            const decoded = jwt.verify(payload.token, this.config.jwt.resetSecret) as any;
            if (decoded.type !== 'reset') {
                throw new Error('Invalid token type');
            }
            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }

            const result = await this.userRepository.markResetTokenUsed(decoded.userId);

            if (result.modifiedCount === 0) {
                throw new Error('Reset link has already been used');
            }

            const hashedPassword = await bcrypt.hash(payload.password, 12);
            await this.userRepository.updatePassword(decoded.userId, hashedPassword);
            return {
                message: 'Password has been reset successfully'
            };
        } catch (error: any) {
            logger.error(`Password reset failed: ${error.message}`);
            throw new Error(error.message || 'Invalid or expired reset token');
        }
    }

    async verifyResetToken(token: string) {
        try {
            const decoded = jwt.verify(token, this.config.jwt.resetSecret) as any;
            if (decoded.type !== 'reset') {
                throw new Error('Invalid token type');
            }

            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.resetTokenUsedAt) {
                throw new Error('Reset link has already been used');
            }

            return {
                message: 'Token is valid',
                isValid: true
            };
        } catch (error: any) {
            throw new Error(error.message || 'Invalid or expired reset token');
        }
    }
}
