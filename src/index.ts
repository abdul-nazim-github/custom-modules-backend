import { Router } from 'express';
import { AuthConfig } from './config/types.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { UserRepository } from './repositories/user.repository.js';
import { ResetPasswordService } from './services/reset-password.service.js';
import { ResetPasswordController } from './controllers/reset-password.controller.js';
import { createResetPasswordRoutes } from './routes/reset-password.routes.js';

export class AuthModule {
    private config: AuthConfig;
    public router: Router;

    constructor(config: AuthConfig) {
        this.config = config;
        this.router = Router();
        this.initialize();
    }
    private initialize() {
        const userRepository = new UserRepository();

        // Auth Module
        const authService = new AuthService(this.config, userRepository);
        const authController = new AuthController(authService);
        this.router.use('/auth', createAuthRoutes(authController, this.config.jwt.accessSecret, userRepository));

        // Password Module
        const resetPasswordService = new ResetPasswordService(userRepository);
        const resetPasswordController = new ResetPasswordController(resetPasswordService);
        this.router.use('/password', createResetPasswordRoutes(resetPasswordController, this.config.jwt.accessSecret, userRepository));
    }

    public static init(config: AuthConfig): AuthModule {
        return new AuthModule(config);
    }
}

export * from './config/types.js';
