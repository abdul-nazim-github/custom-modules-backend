import { Router } from 'express';
import { AuthConfig } from './config/types.js';
import { UserRepository } from './repositories/user.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
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
        const sessionRepository = new SessionRepository();

        const permissionRepository = new PermissionRepository();
        const permissionService = new PermissionService(permissionRepository);
        const permissionController = new PermissionController(permissionService);
        this.router.use('/permissions', createAdvPermissionRoutes(
            permissionController,
            this.config.jwt.accessSecret,
            sessionRepository,
            userRepository
        ));
    }


    public static init(config: AuthConfig): AuthModule {
        return new AuthModule(config);
    }
}

export * from './config/types.js';
