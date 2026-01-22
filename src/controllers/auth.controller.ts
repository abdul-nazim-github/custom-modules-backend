import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.js';

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public login = async (req: Request, res: Response) => {
        try {
            const { email, password, ...extra } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    message: 'Email and password are required',
                    success: false
                });
            }

            if (Object.keys(extra).length > 0) {
                return res.status(400).json({
                    message: `Extra fields not allowed: ${Object.keys(extra).join(', ')}`,
                    success: false
                });
            }

            const result = await this.authService.login({ email, password });
            res.json({
                message: result.message,
                data: result.data,
                success: true
            });
        } catch (error: any) {
            res.status(401).json({
                message: error.message,
                success: false
            });
        }
    };

    public register = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.register({ ...req.body });
            res.json({
                message: result.message,
                data: result.data,
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public logout = async (req: Request, res: Response) => {
        try {
            await this.authService.logout();

            res.json({
                message: 'Logged out successfully',
                success: true
            });
        } catch (error: any) {
            res.status(401).json({
                message: error.message,
                success: false
            });
        }
    }

    public forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    message: 'Email is required',
                    success: false
                });
            }

            const result = await this.authService.forgotPassword({ email });

            if (!result.success) {
                const statusCode = result.message === 'User does not exist.' ? 404 : 500;
                return res.status(statusCode).json(result);
            }

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
            const { token, password } = req.body;

            if (!token || !password) {
                return res.status(400).json({
                    message: 'Token and password are required',
                    success: false
                });
            }

            const result = await this.authService.resetPassword({
                token,
                password
            });
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
