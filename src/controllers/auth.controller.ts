import type { Request, Response } from 'express';
import type { AuthService } from '../services/auth.service.js';

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public login = async (req: Request, res: Response) => {
        const result = await this.authService.login();
        res.json(result);
    };

    public register = async (req: Request, res: Response) => {
        const result = await this.authService.register();
        res.json(result);
    };
}
