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

    router.post('/create', validateBody(Content), contentController.create);
    router.get('/list', contentController.list);
    router.get('/list/:id', contentController.getOne);
    router.put('/update/:id', validateBody(Content), contentController.update);
    router.delete('/delete/:id', contentController.delete);

    return router;
};
