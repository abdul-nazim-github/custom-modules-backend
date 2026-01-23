import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service.js';

export class ContactController {
    private contactService: ContactService;

    constructor(contactService: ContactService) {
        this.contactService = contactService;
    }

    public submit = async (req: Request, res: Response) => {
        try {
            const payload = {
                ...req.body,
            };
            const result = await this.contactService.submitContact(payload);
            res.status(201).json({
                message: result.message,
                data: result.data,
                success: true
            });
        } catch (error: any) {
            // Log the actual error for debugging
            console.error(`Contact submission error: ${error.message}`);

            res.status(400).json({
                message: 'Unable to process your request at this time. Please try again later.',
                success: false
            });
        }
    };

    public list = async (req: Request, res: Response) => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const status = req.query.status ? parseInt(req.query.status as string) : undefined;

            const result = await this.contactService.listContacts({ page, limit, status });

            const from = (page - 1) * limit + 1;
            const to = from + result.data.length - 1;

            res.json({
                data: result.data,
                meta: {
                    totalCount: result.totalCount,
                    from: result.data.length > 0 ? from : 0,
                    to: result.data.length > 0 ? to : 0
                },
                message: result.message,
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public getOne = async (req: Request, res: Response) => {
        try {
            const result = await this.contactService.getContact(req.params.id as string);
            res.json({
                message: result.message,
                data: result.data,
                success: true
            });
        } catch (error: any) {
            res.status(404).json({
                message: error.message,
                success: false
            });
        }
    };

    public updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body;
            const result = await this.contactService.updateContactStatus(req.params.id as string, status);
            res.json({
                message: result.message,
                data: result.data,
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };

    public delete = async (req: Request, res: Response) => {
        try {
            const result = await this.contactService.deleteContact(req.params.id as string);
            res.json({
                message: result.message,
                success: true
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            });
        }
    };
}
