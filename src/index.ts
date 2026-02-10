import { Router } from 'express';
import { AuthConfig } from './config/types.js';
import { ContentRepository } from './repositories/content.repository.js';
import { ContentService } from './services/content.service.js';
import { ContentController } from './controllers/content.controller.js';
import { createContentRoutes } from './routes/content.routes.js';

export class AuthModule {
    private config: AuthConfig;
    public router: Router;

    constructor(config: AuthConfig) {
        this.config = config;
        this.router = Router();
        this.initialize();
    }

    private initialize() {
        const contentRepository = new ContentRepository();
        const contentService = new ContentService(contentRepository);
        const contentController = new ContentController(contentService);

        this.router.use('/content', createContentRoutes(contentController));
    }

    public static init(config: AuthConfig): AuthModule {
        return new AuthModule(config);
    }
}

export * from './config/types.js';
