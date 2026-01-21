import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository.js';

export const checkEmailExists = (userRepository: UserRepository) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: 'Email is required',
                success: false
            });
        }

        const existing = await userRepository.findByEmail(email);
        if (existing) {
            if (existing.deleted_at) {
                return res.status(400).json({
                    message: 'User has been blocked or deleted. Please contact super admin.',
                    success: false
                });
            }
            return res.status(400).json({
                message: 'User already exists',
                success: false
            });
        }

        next();
    };
};
