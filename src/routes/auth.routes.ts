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
    router.get('/me', authMiddleware(accessSecret, sessionRepository, userRepository), authController.me);
    router.post('/register', checkEmailExists(userRepository), validateBody(User), authController.register);
    router.post('/logout', authMiddleware(accessSecret, sessionRepository, userRepository), authController.logout);
    router.post('/forgot-password', authController.forgotPassword);
    router.post('/reset-password', authController.resetPassword);
    router.get('/verify-reset-token', authController.verifyResetToken);

    //  protected routes
    router.get('/profile',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.PROFILE),
        authController.me
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


    router.delete('/users/:userId',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.MANAGE_USERS),
        authController.deleteUser
    );
      router.put('/profile/edit',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        // permissionMiddleware('modules~permission~profile'),
        authController.editProfile
    );

    return router;
};
