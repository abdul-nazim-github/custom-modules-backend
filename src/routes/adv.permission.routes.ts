import { Router } from 'express';
import { PermissionController } from '../controllers/adv.permission.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { permissionMiddleware } from '../middlewares/permission.middleware.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

export const createAdvPermissionRoutes = (
    permissionController: PermissionController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository
): Router => {
    const router = Router();

    const auth = authMiddleware(accessSecret, sessionRepository, userRepository);
    const hasPermission = permissionMiddleware('modules.permission.manage_permissions');

    router.use(auth, hasPermission);

    router.post('/create', permissionController.create);
    router.get('/list', permissionController.list);
    router.get('/matrix', permissionController.getMatrix);
    router.get('/view/:id', permissionController.getOne);
    router.put('/update/:id', permissionController.update);
    router.delete('/delete/:id', permissionController.delete);

    return router;
};
