import { Router } from 'express';
import { PermissionController } from '../controllers/adv.permission.controller.js';

export const createAdvPermissionRoutes = (
    permissionController: PermissionController
): Router => {
    const router = Router();

    router.post('/', permissionController.create);
    router.get('/', permissionController.list);
    router.get('/matrix', permissionController.getMatrix);
    router.get('/:id', permissionController.getOne);
    router.put('/:id', permissionController.update);
    router.delete('/:id', permissionController.delete);

    return router;
};
