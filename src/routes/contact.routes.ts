import { Router } from 'express';
// import { rateLimit } from 'express-rate-limit';
import { ContactController } from '../controllers/contact.controller.js';
import { validateBody } from '../middlewares/contact.middleware.js';
import { ContactDto } from '../dtos/contact.dto.js';

// const contactSubmitLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour
//     max: 5, // Limit each IP to 5 submissions per hour
//     message: {
//         message: 'Too many submissions from this IP, please try again after an hour',
//         success: false
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
// });

export const createContactRoutes = (contactController: ContactController): Router => {
    const router = Router();

    router.post('/submit', validateBody(ContactDto), contactController.submit);
    router.get('/list', contactController.list);
    router.get('/:id', contactController.getOne);
    router.put('/:id/status', contactController.updateStatus);
    router.delete('/:id', contactController.delete);

    return router;
};