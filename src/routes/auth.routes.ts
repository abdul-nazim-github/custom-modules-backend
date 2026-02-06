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
    const auth = authMiddleware(accessSecret, sessionRepository, userRepository);

    router.post('/login', authController.login);
    router.post('/logout', auth, authController.logout);

    //  protected routes
    router.get('/profile',
        auth,
        permissionMiddleware(Permission.PROFILE),
        (req, res) => res.json({ message: 'Welcome to Profile', success: true })
    );

    router.get('/settings',
        auth,
        permissionMiddleware(Permission.SETTINGS),
        (req, res) => res.json({ message: 'Welcome to Settings', success: true })
    );

    router.get('/activity',
        auth,
        permissionMiddleware(Permission.ACTIVITY),
        (req, res) => res.json({ message: 'Welcome to Activity', success: true })
    );

    router.get('/security',
        auth,
        permissionMiddleware(Permission.SECURITY),
        (req, res) => res.json({ message: 'Welcome to Security', success: true })
    );

    router.get('/users',
        auth,
        permissionMiddleware(Permission.MANAGE_USERS),
        authController.listUsers
    );

    router.put('/users/:userId/role',
        auth,
        permissionMiddleware(Permission.MANAGE_USERS),
        authController.updateUserRole
    );

    router.put('/users/:userId/permissions',
        auth,
        permissionMiddleware(Permission.MANAGE_PERMISSIONS),
        authController.updateUserPermissions
    );

    router.delete('/users/:userId',
        auth,
        permissionMiddleware(Permission.MANAGE_USERS),
        authController.deleteUser
    );

    return router;
};
