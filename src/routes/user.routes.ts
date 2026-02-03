import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { permissionMiddleware } from '../middlewares/permission.middleware.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { AssignAccessByEmailDto } from '../dtos/user.access.dto.js';

export const createUserRoutes = (
    userController: UserController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository
): Router => {
    const router = Router();

    const auth = authMiddleware(accessSecret, sessionRepository, userRepository);
    const hasPermission = permissionMiddleware('modules.permission.manage_users');
    router.use(auth, hasPermission);

    router.post('/assign-access', validateBody(AssignAccessByEmailDto), userController.assignAccessByEmail);
    router.post('/create', userController.create);
    router.put('/:id/access', userController.syncAccess);
    return router;
};
