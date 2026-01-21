import { Router } from 'express';
import { ContentController } from '../controllers/content.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { Content } from '../models/content.model.js';

export const createContentRoutes = (contentController: ContentController): Router => {
    const router = Router();

    router.post('/', validateBody(Content), contentController.create);
    router.get('/', contentController.list);
    router.get('/:id', contentController.getOne);
    router.put('/:id', validateBody(Content), contentController.update);
    router.delete('/:id', contentController.delete);

    return router;
};
