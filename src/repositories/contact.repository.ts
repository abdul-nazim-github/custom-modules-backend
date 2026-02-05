import { Contact, IContact } from '../models/contact.model.js';
export class ContactRepository {
    async create(data: Partial<IContact>): Promise<IContact> {
        const contact = new Contact(data);
        return await contact.save();
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
            query.$or = [
                { name: filters.search },
                { email: filters.search }
            ];
        }

        let sortObj: any = { created_at: -1 };
        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const fieldMap: any = { 'date': 'created_at', 'created_at': 'created_at', 'updated_at': 'updated_at' };
            const sortField = fieldMap[field] || field;
            sortObj = { [sortField]: order === 'desc' ? -1 : 1 };
        }

        const items = await Contact.find(query)
            .sort(sortObj)
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
