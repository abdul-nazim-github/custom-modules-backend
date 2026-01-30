import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.js';

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public forgotPassword = async (req: Request, res: Response) => {
        try {
            console.log('forgotPassword request body:', req.body);
            const { email } = req.body;
            if (!email) {
                console.log('Email missing in body');
                return res.status(400).json({
                    message: 'Email is required',
                    success: false
                });
            }

            const result = await this.authService.forgotPassword({ email });
            console.log('forgotPassword service result:', result);

            if (!result.success) {
                const statusCode = result.message === 'User does not exist.' ? 404 : 500;
                console.log(`Returning error status ${statusCode}`);
                return res.status(statusCode).json(result);
            }

            console.log('Returning success 200');
            return res.status(200).json(result);

        } catch (error: any) {
            console.error('forgotPassword error:', error);
            return res.status(500).json({
                message: error.message || 'Something went wrong',
                success: false
            });
        }
    };


    public resetPassword = async (req: Request, res: Response) => {
        try {
            console.log('resetPassword request body:', req.body);
            const { token, password } = req.body;

            if (!token || !password) {
                console.log('Token or password missing');
                return res.status(400).json({
                    message: 'Token and password are required',
                    success: false
                });
            }

            const result = await this.authService.resetPassword({
                token,
                password
            });
            console.log('resetPassword service result:', result);
            return res.status(200).json({
                ...result,
                success: true
            });
        } catch (error: any) {
            console.error('resetPassword error:', error);
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public verifyResetToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({
                    message: 'Token is required',
                    success: false
                });
            }

            const result = await this.authService.verifyResetToken(token as string);
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
