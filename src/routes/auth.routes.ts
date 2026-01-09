import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

export const createAuthRoutes = (
    authController: AuthController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository
): Router => {
    const router = Router();

    router.post('/login', authController.login);
    router.post('/logout', authMiddleware(accessSecret, sessionRepository, userRepository), authController.logout);

    return router;
};
