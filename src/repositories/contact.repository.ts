import { Contact, IContact } from '../models/contact.model.js';

export class ContactRepository {
    async create(data: Partial<IContact>): Promise<IContact> {
        const contact = new Contact(data);
        return await contact.save();
    }

    async findAll(filters: { page: number; limit: number; status?: number }) {
        const query: any = {};
        if (filters.status !== undefined) {
            query.status = filters.status;
        }

        const items = await Contact.find(query)
            .sort({ created_at: -1 })
            .skip((filters.page - 1) * filters.limit)
            .limit(filters.limit);

        const totalCount = await Contact.countDocuments(query);
        return { items, totalCount };
    }

    async findById(id: string): Promise<IContact | null> {
        return await Contact.findById(id);
    }

    async update(id: string, data: Partial<IContact>): Promise<IContact | null> {
        return await Contact.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<IContact | null> {
        return await Contact.findByIdAndDelete(id);
    }
}
