import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionService } from './session.service.js';
import { logger } from '../utils/logger.js';
import { Role, RolePermissions, Permission } from '../config/roles.js';
import { sendResetEmail } from '../utils/email.util.js';

export class AuthService {
    private config: AuthConfig;
    private userRepository: UserRepository;
    private sessionService: SessionService;

    constructor(
        config: AuthConfig,
        userRepository: UserRepository,
        sessionService: SessionService
    ) {
        this.config = config;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
    }

    async register(payload: {
        email: string;
        password: string;
        name?: string;
        role?: Role;
        device: { ip: string; userAgent: string };
    }) {
        const existing = await this.userRepository.findByEmail(payload.email);
        if (existing) {
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
        device: { ip: string; userAgent: string };
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

        const { session, refreshToken } = await this.sessionService.createSession(
            user._id as Types.ObjectId,
            payload.device
        );

        const accessToken = jwt.sign(
            { userId: user._id, sessionId: session._id },
            this.config.jwt.accessSecret,
            { expiresIn: this.config.jwt.accessTTL as any }
        );

        return {
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
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

    async logout(payload: { sessionId: string }) {
        await this.sessionService.deactivateSession(payload.sessionId);
        return {
            message: 'Logged out successfully'
        };
    }

    async updateUserRole(payload: {
        userId: string;
        newRole: Role;
        updatedBy: string;
    }) {
        const updater = await this.userRepository.findById(payload.updatedBy as any);
        if (!updater) {
            throw new Error('Unauthorized');
        }

        const hasPermission = updater.role === Role.SUPER_ADMIN ||
            (updater.permissions && updater.permissions.includes(Permission.MANAGE_USERS));

        if (!hasPermission) {
            throw new Error('Only SUPER_ADMIN or users with manage_users permission can update user roles');
        }

        if (!Object.values(Role).includes(payload.newRole)) {
            throw new Error('Invalid role');
        }

        const newDefaultPermissions = RolePermissions[payload.newRole] || [];

        const user = await this.userRepository.updateRole(payload.userId, payload.newRole, newDefaultPermissions);
        if (!user) {
            throw new Error('User not found');
        }

        logger.info(`User ${payload.userId} role updated to ${payload.newRole} and permissions synced by ${payload.updatedBy}`);

        return {
            message: 'User role and permissions updated successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions
            }
        };
    }

    async updateUserPermissions(payload: {
        userId: string;
        permissions: string[];
        updatedBy: string;
    }) {
        const updater = await this.userRepository.findById(payload.updatedBy as any);
        if (!updater) {
            throw new Error('Unauthorized');
        }

        const hasPermission = updater.role === Role.SUPER_ADMIN ||
            (updater.permissions && updater.permissions.includes(Permission.MANAGE_PERMISSIONS));

        if (!hasPermission) {
            throw new Error('Only SUPER_ADMIN or users with manage_permissions permission can update user permissions');
        }

        const user = await this.userRepository.findById(payload.userId as any);
        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = await this.userRepository.updatePermissions(payload.userId, payload.permissions);

        if (!updatedUser) {
            throw new Error('Failed to update user permissions');
        }
        return {
            message: 'User permissions updated successfully',
            data: {
                id: updatedUser._id,
                email: updatedUser.email,
                role: updatedUser.role,
                permissions: updatedUser.permissions
            }
        };
    }

    async listUsers(payload: {
        page?: number;
        limit?: number;
        role?: Role;
    }) {
        const users = await this.userRepository.findAll({
            page: payload.page || 1,
            limit: payload.limit || 10,
            role: payload.role
        });

        return {
            message: 'Users retrieved successfully',
            data: users.map(user => ({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role || Role.USER,
                permissions: user.permissions || [],
                created_at: (user as any).created_at
            }))
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

            // if (user.resetTokenUsedAt) {
            //     throw new Error('Reset link has already been used');
            // }
            // Mark token as used atomically
            // await this.userRepository.markResetTokenUsed(decoded.userId);
            const result = await this.userRepository.markResetTokenUsed(decoded.userId);

            if (result.modifiedCount === 0) {
                throw new Error('Reset link has already been used');
            }

            const hashedPassword = await bcrypt.hash(payload.password, 12);
            await this.userRepository.updatePassword(decoded.userId, hashedPassword);
            // The user object here refers to the one fetched before the update.
            // The updatePassword method should handle its own success/failure.
            // If updatePassword throws an error, it will be caught by the try/catch.
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

    async deleteUser(payload: {
        userId: string;
        deletedBy: string;
    }) {
        const deleter = await this.userRepository.findById(payload.deletedBy as any);
        if (!deleter || deleter.role !== Role.SUPER_ADMIN) {
            throw new Error('Only SUPER_ADMIN can delete users');
        }
        const user = await this.userRepository.delete(payload.userId);
        if (!user) {
            throw new Error('User not found');
        }
        return {
            message: 'User deleted successfully'
        };
    }
}
