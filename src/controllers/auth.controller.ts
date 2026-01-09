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

}
