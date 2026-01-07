import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

export const createAuthRoutes = (authController: AuthController): Router => {
    const router = Router();

    router.post('/login', authController.login);
    router.post('/register', authController.register);

    return router;
};
