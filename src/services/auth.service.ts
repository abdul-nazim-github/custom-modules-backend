import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionService } from './session.service.js';
import { logger } from '../utils/logger.js';
import { Role, RolePermissions, Permission } from '../config/roles.js';
import { sendResetEmail } from '../utils/email.util.js';
import { PermissionService } from './adv.permission.service.js';

export class AuthService {
    private config: AuthConfig;
    private userRepository: UserRepository;
    private sessionService: SessionService;
    private permissionService: PermissionService;

    constructor(
        config: AuthConfig,
        userRepository: UserRepository,
        sessionService: SessionService,
        permissionService: PermissionService
    ) {
        this.config = config;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
        this.permissionService = permissionService;
    }

    async register(payload: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        role?: string;
        device: { ip: string; userAgent: string };
    }) {
        const existing = await this.userRepository.findByEmail(payload.email);
        if (existing) {
            if (existing.deleted_at) {
                throw new Error('User has been blocked or deleted. Please contact super admin.');
            }
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(payload.password, 12);

        const userRole = payload.role || 'user';
        const defaultPermissions = RolePermissions[userRole as Role] || [];

        const user = await this.userRepository.create({
            email: payload.email,
            password: hashedPassword,
            first_name: payload.first_name,
            last_name: payload.last_name,
            role: [userRole],
            permissions: defaultPermissions
        });

        // Assign default permissions to the new user in the permissions collection
        await this.permissionService.assignDefaultPermissions(user._id.toString(), defaultPermissions);

        return {
            message: 'User registered successfully',
            data: user.toObject()
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

        // Deactivate all existing sessions for this user before creating a new one
        await this.sessionService.deactivateAllForUser(user._id.toString());

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
                user: user.toObject()
            }
        };
    }

    async logout(payload: { sessionId: string }) {
        await this.sessionService.deactivateSession(payload.sessionId);
        return {
            message: 'Logged out successfully'
        };
    }


    async listUsers(payload: {
        page?: number;
        limit?: number;
        role?: string[];
        search?: string;
        sort?: string;
    }) {
        const { items, totalCount } = await this.userRepository.findAll({
            page: payload.page || 1,
            limit: payload.limit || 10,
            role: payload.role,
            search: payload.search,
            sort: payload.sort
        });

        return {
            message: 'Users retrieved successfully',
            data: items.map(user => user.toObject()),
            totalCount
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

    async deleteUser(payload: { userId: string; deletedBy: string }) {
        const deleter = await this.userRepository.findById(payload.deletedBy as any);
        if (!deleter) {
            throw new Error('Unauthorized');
        }

        const hasPermission =
            (deleter.role && deleter.role.includes('super_admin')) ||
            deleter.permissions?.includes(Permission.MANAGE_USERS);

        if (!hasPermission) {
            throw new Error(
                'Only super_admin or users with manage_users permission can delete users'
            );
        }

        const user = await this.userRepository.findById(payload.userId as any);
        if (!user) {
            throw new Error('User not found');
        }
        await this.userRepository.delete(payload.userId);

        return {
            message: 'User deleted successfully'
        };
    }
    async updateProfile(userId: string, data: { first_name: string, last_name: string }) {
        const user = await this.userRepository.findById(userId as any);
        if (!user) {
            throw new Error('User not found');
        }

        user.first_name = data.first_name;
        user.last_name = data.last_name;
        await (user as any).save();

        return {
            message: 'Profile updated successfully',
            data: user.toObject()
        };
    }

    async updateUserRole(payload: {
        userId: string;
        newRole: Role[];
        updatedBy: string;
    }) {
        const updater = await this.userRepository.findById(payload.updatedBy as any);
        if (!updater) {
            throw new Error('Unauthorized');
        }

        const hasPermission = (updater.role && updater.role.includes('super_admin')) ||
            (updater.permissions && updater.permissions.includes(Permission.MANAGE_USERS));

        if (!hasPermission) {
            throw new Error('Only SUPER_ADMIN or users with manage_users permission can update user roles');
        }

        // Validate all roles
        const validRoles = Object.values(Role) as string[];
        for (const role of payload.newRole) {
            if (!validRoles.includes(role)) {
                throw new Error(`Invalid role: ${role}`);
            }
        }

        // Merge permissions from all roles
        const mergedPermissions = new Set<Permission>();
        for (const role of payload.newRole) {
            const rolePermissions = RolePermissions[role] || [];
            rolePermissions.forEach(permission => mergedPermissions.add(permission));
        }

        const user = await this.userRepository.updateRole(
            payload.userId,
            payload.newRole,
            Array.from(mergedPermissions)
        );

        // Sync with permissions collection
        await this.permissionService.assignDefaultPermissions(payload.userId, Array.from(mergedPermissions));

        if (!user) {
            throw new Error('User not found');
        }

        logger.info(`User ${payload.userId} roles updated to [${payload.newRole.join(', ')}] and permissions synced by ${payload.updatedBy}`);

        return {
            message: 'User role and permissions updated successfully',
            data: user.toObject()
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

        const hasPermission = (updater.role && updater.role.includes('super_admin')) ||
            (updater.permissions && updater.permissions.includes(Permission.MANAGE_PERMISSIONS));

        if (!hasPermission) {
            throw new Error('Only SUPER_ADMIN or users with manage_permissions permission can update user permissions');
        }

        const user = await this.userRepository.findById(payload.userId as any);
        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = await this.userRepository.updatePermissions(payload.userId, payload.permissions);

        // Sync with permissions collection
        // Sync with permissions collection
        await this.permissionService.syncPermissions(payload.userId, payload.permissions);

        if (!updatedUser) {
            throw new Error('Failed to update user permissions');
        }
        return {
            message: 'User permissions updated successfully',
            data: updatedUser.toObject()
        };
    }
}
