import { Router } from 'express';
import { ContactRepository } from './repositories/contact.repository.js';
import { ContactService } from './services/contact.service.js';
import { ContactController } from './controllers/contact.controller.js';
import { createContactRoutes } from './routes/contact.routes.js';

export class ContactModule {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initialize();
    }

    private initialize() {
        const contactRepository = new ContactRepository();
        const contactService = new ContactService(contactRepository);
        const contactController = new ContactController(contactService);
        this.router.use('/contact', createContactRoutes(contactController));
    }

    public static init(): ContactModule {
        return new ContactModule();
    }
}
