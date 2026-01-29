import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ContactController } from '../controllers/contact.controller.js';
import { validateBody, protectContactListing } from '../middlewares/contact.middleware.js';
import { ContactDto } from '../dtos/contact.dto.js';
import { UserRepository } from '../repositories/user.repository.js';

const contactSubmitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 submissions per hour
    message: {
        message: 'Too many submissions from this IP, please try again after an hour',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const createContactRoutes = (
    contactController: ContactController,
    accessSecret: string,
    userRepository: UserRepository
): Router => {
    const router = Router();

    const protect = protectContactListing(accessSecret, userRepository);

    router.post('/submit', validateBody(ContactDto), contactController.submit);
    router.get('/list',
        protect,
        contactController.list
    );

    router.get('/:id',
        protect,
        contactController.getOne
    );

    return router;
};