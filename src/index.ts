import { Router } from 'express';
import { AuthConfig } from './config/types.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { UserRepository } from './repositories/user.repository.js';
import { PermissionController } from './controllers/adv.permission.controller.js';
import { createAdvPermissionRoutes } from './routes/adv.permission.routes.js';
import { PermissionRepository } from './repositories/adv.permission.repository.js';
import { PermissionService } from './services/adv.permission.service.js';

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
        const authService = new AuthService(this.config, userRepository);
        const authController = new AuthController(authService);
        this.router.use('/auth', createAuthRoutes(authController, this.config.jwt.accessSecret, userRepository));

        const permissionRepository = new PermissionRepository();
        const permissionService = new PermissionService(permissionRepository);
        const permissionController = new PermissionController(permissionService);
        this.router.use('/permissions', createAdvPermissionRoutes(
            permissionController,
            this.config.jwt.accessSecret,
            userRepository
        ));
    }

    public static init(config: AuthConfig): AuthModule {
        return new AuthModule(config);
    }
}

export * from './config/types.js';
