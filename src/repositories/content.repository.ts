import { ContentModel, Content } from '../models/content.model.js';
import { Types } from 'mongoose';

export class ContentRepository {
    async create(data: Partial<Content>) {
        return ContentModel.create(data);
    }

    async findById(id: string) {
        return ContentModel.findById(id);
    }

    async findAll(filters: {
        page: number;
        limit: number;
        status?: number;
    }) {
        const query: any = {};
        if (filters.status !== undefined) {
            query.status = filters.status;
        }

        const skip = (filters.page - 1) * filters.limit;

        const [items, totalCount] = await Promise.all([
            ContentModel.find(query)
                .skip(skip)
                .limit(filters.limit)
                .sort({ created_at: -1 })
                .exec(),
            ContentModel.countDocuments(query)
        ]);

        return { items, totalCount };
    }

    async update(id: string, data: Partial<Content>) {
        return ContentModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );
    }

    async delete(id: string) {
        return ContentModel.findByIdAndDelete(id);
    }
}
