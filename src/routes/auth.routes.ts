import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { permissionMiddleware } from '../middlewares/permission.middleware.js';
import { Permission } from '../config/roles.js';
export const createAuthRoutes = (
    authController: AuthController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository
): Router => {
    const router = Router();

    //  protected routes
    router.get('/profile',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.PROFILE),
        (req, res) => res.json({ message: 'Welcome to Profile', success: true })
    );

    router.get('/settings',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.SETTINGS),
        (req, res) => res.json({ message: 'Welcome to Settings', success: true })
    );

    router.get('/activity',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.ACTIVITY),
        (req, res) => res.json({ message: 'Welcome to Activity', success: true })
    );

    router.get('/security',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.SECURITY),
        (req, res) => res.json({ message: 'Welcome to Security', success: true })
    );

    router.get('/users',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.MANAGE_USERS),
        authController.listUsers
    );

    router.put('/users/:userId/role',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.MANAGE_USERS),
        authController.updateUserRole
    );

    router.put('/users/:userId/permissions',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.MANAGE_PERMISSIONS),
        authController.updateUserPermissions
    );

    return router;
};
