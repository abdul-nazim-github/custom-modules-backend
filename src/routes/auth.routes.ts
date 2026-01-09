import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { User } from '../models/user.model.js';
import { checkEmailExists } from '../middlewares/user.middleware.js';
import { UserRepository } from '../repositories/user.repository.js';

export const createAuthRoutes = (
    authController: AuthController,
    userRepository: UserRepository
): Router => {
    const router = Router();

    router.post('/register',
        checkEmailExists(userRepository),
        validateBody(User),
        authController.register
    );

    return router;
};
