import { Request, Response } from 'express';
import { ContentService } from '../services/content.service.js';

export class ContentController {
    private contentService: ContentService;

    constructor(contentService: ContentService) {
        this.contentService = contentService;
    }

    public create = async (req: Request, res: Response) => {
        try {
            const result = await this.contentService.createContent(req.body);
            res.status(201).json({
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

    public getOne = async (req: Request, res: Response) => {
        try {
            const result = await this.contentService.getContent(req.params.id as string);
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

    public list = async (req: Request, res: Response) => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const status = req.query.status ? parseInt(req.query.status as string) : undefined;

            const result = await this.contentService.listContent({
                page,
                limit,
                status
            });

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

    public update = async (req: Request, res: Response) => {
        try {
            const result = await this.contentService.updateContent(req.params.id as string, req.body);
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
            const result = await this.contentService.deleteContent(req.params.id as string);
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
