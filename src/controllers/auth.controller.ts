import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.js';

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

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
}
