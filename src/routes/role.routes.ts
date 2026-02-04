import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { RoleUserDto, UpdateRoleUserDto } from '../dtos/role.user.dto.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { permissionMiddleware } from '../middlewares/permission.middleware.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

export const createRoleRoutes = (
    roleController: RoleController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository
): Router => {
    const router = Router();

    const auth = authMiddleware(accessSecret, sessionRepository, userRepository);
    const hasPermission = permissionMiddleware('modules~permission~manage_permissions');
    router.use(auth, hasPermission);

    router.post('/create', validateBody(RoleUserDto), roleController.create);
    router.get('/list', roleController.list);
    router.put('/update/:id', validateBody(UpdateRoleUserDto), roleController.update);
    // may be needed (the delete one 
    router.delete('/delete/:id', roleController.delete);
    return router;
};
