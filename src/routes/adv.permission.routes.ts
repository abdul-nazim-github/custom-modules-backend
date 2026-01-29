import { Router } from 'express';
import { PermissionController } from '../controllers/adv.permission.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { permissionMiddleware } from '../middlewares/permission.middleware.js';
import { Permission } from '../config/roles.js';
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
    const hasPermission = permissionMiddleware(Permission.MANAGE_PERMISSIONS);

    router.use(auth, hasPermission);

    router.post('/', permissionController.create);
    router.get('/', permissionController.list);
    router.get('/matrix', permissionController.getMatrix);
    router.get('/:id', permissionController.getOne);
    router.put('/:id', permissionController.update);
    router.delete('/:id', permissionController.delete);

    return router;
};
