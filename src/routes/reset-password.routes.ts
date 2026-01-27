import { Router } from 'express';
import { ResetPasswordController } from '../controllers/reset-password.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { UserRepository } from '../repositories/user.repository.js';

export const createResetPasswordRoutes = (
    resetPasswordController: ResetPasswordController,
    accessSecret: string,
    userRepository: UserRepository
): Router => {
    const router = Router();

    router.post('/change', authMiddleware(accessSecret, userRepository), resetPasswordController.changePassword);

    return router;
};
