import { ContentRepository } from '../repositories/content.repository.js';
import { Content } from '../models/content.model.js';

export class ContentService {
    private contentRepository: ContentRepository;

    constructor(contentRepository: ContentRepository) {
        this.contentRepository = contentRepository;
    }

    async createContent(payload: Partial<Content>) {
        return this.contentRepository.create(payload);
    }

    async getContent(id: string) {
        const content = await this.contentRepository.findById(id);
        if (!content) {
            throw new Error('Content not found');
        }
        return content;
    }

    async listContent(filters: {
        page?: number;
        limit?: number;
        status?: number;
    }) {
        return this.contentRepository.findAll({
            page: filters.page || 1,
            limit: filters.limit || 10,
            status: filters.status
        });
    }

    async updateContent(id: string, payload: Partial<Content>) {
        const content = await this.contentRepository.update(id, payload);
        if (!content) {
            throw new Error('Content not found');
        }
        return content;
    }

    async deleteContent(id: string) {
        const content = await this.contentRepository.delete(id);
        if (!content) {
            throw new Error('Content not found');
        }
        return content;
    }
}
