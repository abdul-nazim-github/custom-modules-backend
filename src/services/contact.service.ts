import { ContactRepository } from '../repositories/contact.repository.js';
import { IContact } from '../models/contact.model.js';
import { sendEmail } from '../utils/email.util.js';
import { logger } from '../utils/logger.js';
import he from 'he';

export class ContactService {
    private contactRepository: ContactRepository;

    constructor(contactRepository: ContactRepository) {
        this.contactRepository = contactRepository;
    }

    async submitContact(payload: Partial<IContact>) {
        const sanitizedPayload = {
            ...payload,
            name: payload.name ? he.encode(payload.name) : '',
            subject: payload.subject ? he.encode(payload.subject) : '',
            message: payload.message ? he.encode(payload.message) : '',
        };

        const contact = await this.contactRepository.create(sanitizedPayload as any);

        // Send Admin Notification
        sendEmail({
            to: process.env.ADMIN_EMAIL || 'admin@example.com',
            subject: `New Contact Form Submission: ${contact.subject}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${contact.name}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Subject:</strong> ${contact.subject}</p>
                <p><strong>Message:</strong> ${contact.message}</p>
            `
        }).catch(err => logger.error(`Failed to send admin email: ${err.message}`));

        // Send User Auto-Reply
        sendEmail({
            to: contact.email,
            subject: 'Thank you for contacting us',
            html: `
                <h3>Hello ${contact.name},</h3>
                <p>Thank you for reaching out to us. We have received your message regarding "<strong>${contact.subject}</strong>" and will get back to you as soon as possible.</p>
                <p>Best regards,<br>The Team</p>
            `
        }).catch(err => logger.error(`Failed to send user auto-reply: ${err.message}`));

        return {
            message: 'Contact form submitted successfully. We have sent you a confirmation email.',
            data: contact
        };
    }

    async listContacts(filters: { page: number; limit: number; status?: number }) {
        const { items, totalCount } = await this.contactRepository.findAll(filters);
        return {
            message: 'Contacts retrieved successfully',
            data: items,
            totalCount
        };
    }

    async getContact(id: string) {
        const contact = await this.contactRepository.findById(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        return {
            message: 'Contact retrieved successfully',
            data: contact
        };
    }

    async updateContactStatus(id: string, status: number) {
        const contact = await this.contactRepository.update(id, { status } as any);
        if (!contact) {
            throw new Error('Contact not found');
        }
        return {
            message: 'Contact status updated successfully',
            data: contact
        };
    }

    async deleteContact(id: string) {
        const contact = await this.contactRepository.delete(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        return {
            message: 'Contact deleted successfully'
        };
    }
}
