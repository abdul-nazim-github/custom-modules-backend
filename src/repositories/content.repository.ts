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
        search?: string;
        sort?: string;
    }) {
        const query: any = {};
        if (filters.status !== undefined) {
            query.status = filters.status;
        }
        if (filters.search) {
            query.title = { $regex: filters.search, $options: 'i' };
        }
        query.deleted_at = { $exists: false };

        const skip = (filters.page - 1) * filters.limit;

        let sortObj: any = { created_at: -1 };
        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const fieldMap: any = { 'date': 'created_at', 'created_at': 'created_at', 'updated_at': 'updated_at' };
            const sortField = fieldMap[field] || field;
            sortObj = { [sortField]: order === 'desc' ? -1 : 1 };
        }

        const [items, totalCount] = await Promise.all([
            ContentModel.find(query)
                .skip(skip)
                .limit(filters.limit)
                .sort(sortObj)
                .exec(),
            ContentModel.countDocuments(query)
        ]);

        return { items, totalCount };
    }

    async update(id: string, data: Partial<Content>) {
        return ContentModel.findByIdAndUpdate(
            id,
            { $set: { ...data, updated_at: new Date() } },
            { new: true }
        );
    }

    async delete(id: string) {
        return ContentModel.findByIdAndUpdate(id,
            {
                deleted_at: new Date()
            },
            { new: true });
    }
}
