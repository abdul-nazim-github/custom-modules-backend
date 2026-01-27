import { ContentRepository } from '../repositories/content.repository.js';
import { Content } from '../models/content.model.js';

export class ContentService {
    private contentRepository: ContentRepository;

    constructor(contentRepository: ContentRepository) {
        this.contentRepository = contentRepository;
    }

    async createContent(payload: Partial<Content>) {
        const content = await this.contentRepository.create(payload);

        return {
            message: 'Content created successfully',
            data: {
                id: content._id,
                title: content.title,
                body: content.shortDescription,
                status: content.status,
                created_at: content.created_at,
            }
        };
    }

    
    async getContent(id: string) {
        const content = await this.contentRepository.findById(id);
        if (!content) {
            throw new Error('Content not found');
        }

        return {
            message: 'Content retrieved successfully',
            data: {
                id: content._id,
                title: content.title,
                body: content.shortDescription,
                status: content.status,
                created_at: content.created_at,
                ...(content.updated_at && { updated_at: content.updated_at }),
            }
        };
    }
    
    async listContent(filters: {
        page?: number;
        limit?: number;
        status?: number;
    }) {
        const { items, totalCount } = await this.contentRepository.findAll({
            page: filters.page || 1,
            limit: filters.limit || 10,
            status: filters.status
        });
        return {
            message: 'Content list retrieved successfully',
            data: items.map(content => ({
                id: content._id,
                title: content.title,
                body: content.shortDescription,
                status: content.status,
                created_at: content.created_at,
                ...(content.updated_at && { updated_at: content.updated_at }),
            })),
            totalCount
        };
    }

    async updateContent(id: string, payload: Partial<Content>) {
        const content = await this.contentRepository.update(id, payload);
        if (!content) {
            throw new Error('Content not found');
        }
        if (content.deleted_at) {
            throw new Error('This content has been deleted.');
        }
        return {
            message: 'Content updated successfully',
            data: {
                id: content._id,
                title: content.title,
                body: content.shortDescription,
                status: content.status,
                created_at: content.created_at,
                updated_at: content.updated_at,
            }
        };
    }

    async deleteContent(id: string) {
        const content = await this.contentRepository.findById(id);

        if (!content) {
            throw new Error('Content not found');
        }

        if (content.deleted_at) {
            throw new Error('This content has already been deleted.');
        }

        await this.contentRepository.delete(id);

        return {
            message: 'Content deleted successfully'
        };
    }

}
