import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { User } from '../models/user.model.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { UserRepository } from '../repositories/user.repository.js';
import { checkEmailExists } from '../middlewares/user.middleware.js';

export const createAuthRoutes = (
    authController: AuthController,
    accessSecret: string,
    userRepository: UserRepository
): Router => {
    const router = Router();

    router.post('/login', authController.login);
    router.post('/register', checkEmailExists(userRepository), validateBody(User), authController.register);
    router.post('/logout', authMiddleware(accessSecret, userRepository), authController.logout);
    router.post('/forgot-password', authController.forgotPassword);
    router.post('/reset-password', authController.resetPassword);
    router.get('/verify-reset-token', authController.verifyResetToken);

    //  protected routes
    router.get('/profile',
        authMiddleware(accessSecret, userRepository),
        (req, res) => res.json({ message: 'Welcome to Profile', success: true })
    );

    router.get('/settings',
        authMiddleware(accessSecret, userRepository),
        (req, res) => res.json({ message: 'Welcome to Settings', success: true })
    );

    router.get('/activity',
        authMiddleware(accessSecret, userRepository),
        (req, res) => res.json({ message: 'Welcome to Activity', success: true })
    );

    router.get('/security',
        authMiddleware(accessSecret, userRepository),
        (req, res) => res.json({ message: 'Welcome to Security', success: true })
    );

    return router;
};
