import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.js';

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const device = {
                ip: req.ip || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown'
            };
            const result = await this.authService.login({ email, password, device });
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    };

    public register = async (req: Request, res: Response) => {
        try {
            const device = {
                ip: req.ip || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown'
            };
            const result = await this.authService.register({ ...req.body, device });
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    public refresh = async (req: Request, res: Response) => {
        try {
            const { refreshToken } = req.body;
            const device = {
                ip: req.ip || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown'
            };
            const result = await this.authService.refresh({ refreshToken, device });
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    };
}
