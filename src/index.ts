import { Router } from 'express';
import { AuthConfig } from './config/types.js';
import { UserRepository } from './repositories/user.repository.js';
import { ResetPasswordService } from './services/reset-password.service.js';
import { ResetPasswordController } from './controllers/reset-password.controller.js';
import { createResetPasswordRoutes } from './routes/reset-password.routes.js';


export class PasswordResetModule {
    private config: AuthConfig;
    public router: Router;

    constructor(config: AuthConfig) {
        this.config = config;
        this.router = Router();
        this.initialize();
    }
    private initialize() {
        const userRepository = new UserRepository();

        // Password Module
        const resetPasswordService = new ResetPasswordService(userRepository);
        const resetPasswordController = new ResetPasswordController(resetPasswordService);
        this.router.use('/password', createResetPasswordRoutes(resetPasswordController, this.config.jwt.accessSecret, userRepository));
    }

    public static init(config: AuthConfig): PasswordResetModule {
        return new PasswordResetModule(config);
    }
}

export * from './config/types.js';
