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
                message: 'Content created successfully',
                data: result,
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
            const result = await this.contentService.getContent(req.params.id);
            res.json({
                data: result,
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

            const { items, totalCount } = await this.contentService.listContent({
                page,
                limit,
                status
            });

            const from = (page - 1) * limit + 1;

            res.json({
                data: {
                    items,
                    totalCount,
                    from: items.length > 0 ? from : 0
                },
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
            const result = await this.contentService.updateContent(req.params.id, req.body);
            res.json({
                message: 'Content updated successfully',
                data: result,
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
            await this.contentService.deleteContent(req.params.id);
            res.json({
                message: 'Content deleted successfully',
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
