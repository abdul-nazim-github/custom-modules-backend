import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { logger } from '../utils/logger.js';
import { Role, RolePermissions } from '../config/roles.js';
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

    async register(payload: {
        email: string;
        password: string;
        name?: string;
        role?: Role;
    }) {
        const existing = await this.userRepository.findByEmail(payload.email);
        if (existing) {
            if (existing.deleted_at) {
                throw new Error('User has been blocked or deleted. Please contact super admin.');
            }
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(payload.password, 12);

        const userRole = payload.role || Role.USER;
        const defaultPermissions = RolePermissions[userRole] || [];

        const user = await this.userRepository.create({
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
            role: userRole,
            permissions: defaultPermissions
        });

        return {
            message: 'User registered successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                created_at: (user as any).created_at
            }
        };
    }

    async login(payload: {
        email: string;
        password: string;
    }) {
        const user = await this.userRepository.findByEmail(payload.email);
        if (!user || user.deleted_at) {
            logger.warn(`Failed login attempt: User not found or deleted for email ${payload.email}`);
            throw new Error('Invalid credentials');
        }

        if (!user.password) {
            logger.warn(`Failed login attempt: User ${payload.email} has no password set`);
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(payload.password, user.password);
        if (!isValid) {
            logger.warn(`Failed login attempt: Incorrect password for user ${payload.email}`);
            throw new Error('Invalid credentials');
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            this.config.jwt.accessSecret,
            { expiresIn: this.config.jwt.accessTTL as any }
        );

        return {
            message: 'Login successful',
            data: {
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role || Role.USER,
                    permissions: user.permissions || []
                }
            }
        };
    }

    async logout() {
        return {
            message: 'Logged out successfully'
        };
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
