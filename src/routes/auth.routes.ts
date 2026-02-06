import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { permissionMiddleware } from '../middlewares/permission.middleware.js';
import { Permission } from '../config/roles.js';
import { UserRepository } from '../repositories/user.repository.js';

export const createAuthRoutes = (
    authController: AuthController,
    accessSecret: string,
    userRepository: UserRepository
) => {
    const router = Router();
    const auth = authMiddleware(accessSecret, userRepository);

    // User Management
    router.get('/users', auth, permissionMiddleware(Permission.MANAGE_USERS), authController.listUsers);
    router.put('/users/:userId/role', auth, permissionMiddleware(Permission.MANAGE_USERS), authController.updateUserRole);
    router.put('/users/:userId/permissions', auth, permissionMiddleware(Permission.MANAGE_PERMISSIONS), authController.updateUserPermissions);
    router.delete('/users/:userId', auth, permissionMiddleware(Permission.MANAGE_USERS), authController.deleteUser);

    return router;
};
