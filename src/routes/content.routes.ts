import { Router } from 'express';
import { ContentController } from '../controllers/content.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { Content } from '../models/content.model.js';

export const createContentRoutes = (
    contentController: ContentController
): Router => {
    const router = Router();

    router.post('/create', validateBody(Content), contentController.create);
    router.get('/list', contentController.list);
    router.get('/list/:id', contentController.getOne);
    router.put('/update/:id', validateBody(Content), contentController.update);
    router.delete('/delete/:id', contentController.delete);

    return router;
};
