import { Router } from 'express';
import { AuthConfig } from './config/types.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { SessionService } from './services/session.service.js';
import { UserRepository } from './repositories/user.repository.js';
import { SessionRepository } from './repositories/session.repository.js';

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
        const sessionRepository = new SessionRepository();
        const sessionService = new SessionService(sessionRepository, this.config);
        const authService = new AuthService(this.config, userRepository, sessionService);
        const authController = new AuthController(authService);
        this.router.use('/auth', createAuthRoutes(authController, this.config.jwt.accessSecret, sessionRepository, userRepository));
    }

    public static init(config: AuthConfig): AuthModule {
        return new AuthModule(config);
    }
}

export * from './config/types.js';
