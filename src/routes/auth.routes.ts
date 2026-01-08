import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { User } from '../models/user.model.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { SessionRepository } from '../repositories/session.repository.js';

export const createAuthRoutes = (
    authController: AuthController,
    accessSecret: string,
    sessionRepository: SessionRepository
): Router => {
    const router = Router();

    router.post('/login', authController.login);
    router.post('/register', validateBody(User), authController.register);
    // router.post('/logout', authController.logout);
    // router.post('/refresh', authController.refresh);
    router.post('/logout', authMiddleware(accessSecret, sessionRepository), authController.logout);

    return router;
};
