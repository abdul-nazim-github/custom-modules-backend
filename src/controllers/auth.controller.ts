import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.js';
import { Role } from '../config/roles.js';
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

            const device = {
                ip: req.ip || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown'
            };
            const result = await this.authService.login({ email, password, device });
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
            const device = {
                ip: req.ip || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown'
            };
            const result = await this.authService.register({ ...req.body, device });
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
            if (!req.sessionId) {
                return res.status(401).json({
                    message: 'Session not found',
                    success: false
                });
            }

            await this.authService.logout({
                sessionId: req.sessionId
            });

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

    public updateUserRole = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const updatedBy = req.user?.id;

            if (!updatedBy) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.authService.updateUserRole({
                userId: userId as string,
                newRole: role,
                updatedBy
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

    public updateUserPermissions = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { permissions } = req.body;
            const updatedBy = req.user?.id;

            if (!updatedBy) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }
            const result = await this.authService.updateUserPermissions({
                userId: userId as string,
                permissions,
                updatedBy
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

    public listUsers = async (req: Request, res: Response) => {
        try {
            const { page, limit, role } = req.query;

            const result = await this.authService.listUsers({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                role: role as Role
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

    public deleteUser = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const deletedBy = req.user?.id;

            if (!deletedBy) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    success: false
                });
            }

            const result = await this.authService.deleteUser({
                userId: userId as string,
                deletedBy
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
