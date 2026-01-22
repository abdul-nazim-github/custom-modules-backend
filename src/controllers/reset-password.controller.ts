import type { Request, Response } from 'express';
import type { ResetPasswordService } from '../services/reset-password.service.js';

export class ResetPasswordController {
    private resetPasswordService: ResetPasswordService;

    constructor(resetPasswordService: ResetPasswordService) {
        this.resetPasswordService = resetPasswordService;
    }

    public changePassword = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            const { oldPassword, newPassword } = req.body;

            if (!userId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    message: 'Old password and new password are required',
                    success: false
                });
            }

            const result = await this.resetPasswordService.changePassword({
                userId,
                oldPassword,
                newPassword
            });

            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };
}
