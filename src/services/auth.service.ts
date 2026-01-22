import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionService } from './session.service.js';
import { logger } from '../utils/logger.js';
import { Role, RolePermissions } from '../config/roles.js'; 
import { Permission } from '../config/roles.js';
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

        logger.info(`User ${payload.userId} permissions updated by ${payload.updatedBy}`);

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
    async deleteUser(payload: { userId: string; deletedBy: string }) {
        const deleter = await this.userRepository.findById(payload.deletedBy as any);
        if (!deleter) {
            throw new Error('Unauthorized');
        }

        const hasPermission =
            deleter.role === Role.SUPER_ADMIN ||
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
