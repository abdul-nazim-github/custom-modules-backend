import { Router } from 'express';
import { ContentController } from '../controllers/content.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { Content } from '../models/content.model.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

export const createContentRoutes = (
    contentController: ContentController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository
): Router => {
    const router = Router();

    // All content routes require authentication
    router.use(authMiddleware(accessSecret, sessionRepository, userRepository));

    router.post('/', validateBody(Content), contentController.create);
    router.get('/', contentController.list);
    router.get('/:id', contentController.getOne);
    router.put('/:id', validateBody(Content), contentController.update);
    router.delete('/:id', contentController.delete);

    return router;
};
