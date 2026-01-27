import type { Request, Response } from 'express';
import { ResetPasswordService } from '../services/reset-password.service.js';


export class ResetPasswordController {
    private resetPasswordService: ResetPasswordService;

    constructor(resetPasswordService: ResetPasswordService) {
        this.resetPasswordService = resetPasswordService;
    }

    public changePassword = async (req: Request, res: Response) => {
        try {
            const userId = req.reset?.id;
            const { newPassword } = req.body;

            if (!userId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            if (!newPassword) {
                return res.status(400).json({
                    message: 'New password is required',
                    success: false
                });
            }

            const result = await this.resetPasswordService.changePassword({
                userId,
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