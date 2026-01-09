import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { User } from '../models/user.model.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { permissionMiddleware } from '../middlewares/permission.middleware.js';
import { Role, Permission } from '../config/roles.js';
import { checkEmailExists } from '../middlewares/user.middleware.js';
export const createAuthRoutes = (
    authController: AuthController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository
): Router => {
    const router = Router();

    router.post('/login', authController.login);
    router.post('/register', checkEmailExists(userRepository), validateBody(User), authController.register);
    router.post('/logout', authMiddleware(accessSecret, sessionRepository, userRepository), authController.logout);

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

    return router;
};
