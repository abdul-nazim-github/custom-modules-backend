import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

export const createAuthRoutes = (
    authController: AuthController
): Router => {
    const router = Router();

    router.post('/forgot-password', authController.forgotPassword);
    router.post('/reset-password', authController.resetPassword);
    router.get('/verify-reset-token', authController.verifyResetToken);

    return router;
};
