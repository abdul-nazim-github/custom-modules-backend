import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { User } from '../models/user.model.js';

export const createAuthRoutes = (authController: AuthController): Router => {
    const router = Router();

    router.post('/login', authController.login);
    router.post('/register', validateBody(User), authController.register);
    // router.post('/refresh', authController.refresh);

    return router;
};
