import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionService } from './session.service.js';
import { logger } from '../utils/logger.js';
import { Role, RolePermissions, Permission } from '../config/roles.js';

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
                user: {
                    id: user._id,
                    email: user.email,
                    full_name: `${user.first_name} ${user.last_name}`.trim(),
                    role: user.role || [Role.USER],
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

    // async updateUserRole(payload: {
    //     userId: string;
    //     newRole: Role;
    //     updatedBy: string;
    // }) {
    //     const updater = await this.userRepository.findById(payload.updatedBy as any);
    //     if (!updater) {
    //         throw new Error('Unauthorized');
    //     }

    //     const hasPermission = (updater.role && updater.role.includes('super_admin')) ||
    //         (updater.permissions && updater.permissions.includes(Permission.MANAGE_USERS));

    //     if (!hasPermission) {
    //         throw new Error('Only SUPER_ADMIN or users with manage_users permission can update user roles');
    //     }

    //     if (!Object.values(Role).includes(payload.newRole)) {
    //         throw new Error('Invalid role');
    //     }

    //     const newDefaultPermissions = RolePermissions[payload.newRole] || [];

    //     const user = await this.userRepository.updateRole(payload.userId, [payload.newRole], newDefaultPermissions);
    //     if (!user) {
    //         throw new Error('User not found');
    //     }

    //     logger.info(`User ${payload.userId} role updated to ${payload.newRole} and permissions synced by ${payload.updatedBy}`);

    //     return {
    //         message: 'User role and permissions updated successfully',
    //         data: {
    //             id: user._id,
    //             email: user.email,
    //             name: user.name,
    //             role: user.role,
    //             permissions: user.permissions
    //         }
    //     };
    // }

        async updateUserRole(payload: {
    userId: string;
    newRole: Role[];  // ← Changed to array
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

    // Validate all roles (NEW - loops through array)
    for (const role of payload.newRole) {
        if (!Object.values(Role).includes(role)) {
            throw new Error(`Invalid role: ${role}`);
        }
    }

    // Merge permissions from all roles (NEW - merges permissions)
    const mergedPermissions = new Set<Permission>();
    for (const role of payload.newRole) {
        const rolePermissions = RolePermissions[role] || [];
        rolePermissions.forEach(permission => mergedPermissions.add(permission));
    }

    const user = await this.userRepository.updateRole(
        payload.userId, 
        payload.newRole,  // ← Pass array directly
        Array.from(mergedPermissions)  // ← Pass merged permissions
    );
    
    if (!user) {
        throw new Error('User not found');
    }

    logger.info(`User ${payload.userId} roles updated to [${payload.newRole.join(', ')}] and permissions synced by ${payload.updatedBy}`);

    return {
        message: 'User role and permissions updated successfully',
        data: {
            id: user._id,
            email: user.email,
            full_name: `${user.first_name} ${user.last_name}`.trim(),
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
            data: items.map(user => ({
                id: user._id,
                email: user.email,
                full_name: `${user.first_name} ${user.last_name}`.trim(),
                role: user.role || [Role.USER],
                permissions: user.permissions || [],
                created_at: (user as any).created_at
            })),
            totalCount
        };
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
                'Only SUPER_ADMIN or users with MANAGE_USERS permission can delete users'
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

}
