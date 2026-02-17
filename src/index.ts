import { Router } from 'express';
import { AuthConfig } from './config/types.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { SessionService } from './services/session.service.js';
import { UserRepository } from './repositories/user.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
import { ContentRepository } from './repositories/content.repository.js';
import { ContentService } from './services/content.service.js';
import { ContentController } from './controllers/content.controller.js';
import { createContentRoutes } from './routes/content.routes.js';
import { ResetPasswordService } from './services/reset-password.service.js';
import { ResetPasswordController } from './controllers/reset-password.controller.js';
import { createResetPasswordRoutes } from './routes/reset-password.routes.js';
import { ContactRepository } from './repositories/contact.repository.js';
import { ContactService } from './services/contact.service.js';
import { ContactController } from './controllers/contact.controller.js';
import { createContactRoutes } from './routes/contact.routes.js';
import { RoleService } from './services/role.service.js';
import { RoleController } from './controllers/role.controller.js';
import { createRoleRoutes } from './routes/role.routes.js';
import { UserController } from './controllers/user.controller.js';
import { createUserRoutes } from './routes/user.routes.js';
import { PermissionRepository } from './repositories/adv.permission.repository.js';
import { PermissionService } from './services/adv.permission.service.js';
import { PermissionController } from './controllers/adv.permission.controller.js';
import { createAdvPermissionRoutes } from './routes/adv.permission.routes.js';

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

        const permissionRepository = new PermissionRepository();
        const permissionService = new PermissionService(permissionRepository, userRepository);

        const authService = new AuthService(this.config, userRepository, sessionService, permissionService);
        const authController = new AuthController(authService);
        this.router.use('/auth', createAuthRoutes(authController, this.config.jwt.accessSecret, sessionRepository, userRepository));

        const contentRepository = new ContentRepository();
        const contentService = new ContentService(contentRepository);
        const contentController = new ContentController(contentService);
        this.router.use('/content', createContentRoutes(contentController, this.config.jwt.accessSecret, sessionRepository, userRepository));

        const permissionController = new PermissionController(permissionService);
        this.router.use('/permissions', createAdvPermissionRoutes(
            permissionController,
            this.config.jwt.accessSecret,
            sessionRepository,
            userRepository
        ));

        const resetPasswordService = new ResetPasswordService(userRepository);
        const resetPasswordController = new ResetPasswordController(resetPasswordService);
        this.router.use('/password', createResetPasswordRoutes(resetPasswordController, this.config.jwt.accessSecret, userRepository));

        const contactRepository = new ContactRepository();
        const contactService = new ContactService(contactRepository);
        const contactController = new ContactController(contactService);
        this.router.use('/contact', createContactRoutes(contactController, this.config.jwt.accessSecret, userRepository));


        const roleService = new RoleService();
        const roleController = new RoleController(roleService);
        this.router.use('/roles', createRoleRoutes(
            roleController,
            this.config.jwt.accessSecret,
            sessionRepository,
            userRepository
        ));

        // 2. User Access Integration
        const userController = new UserController(roleService);
        this.router.use('/users', createUserRoutes(
            userController,
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
