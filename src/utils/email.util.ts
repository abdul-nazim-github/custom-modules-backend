import nodemailer from 'nodemailer';
import { logger } from './logger.js';

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'mail.smtp2go.com',
            port: parseInt(process.env.EMAIL_PORT || '2525'),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'no-reply@example.com',
            // from:'roshni.singh@codeclouds.co.in',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error: any) {
        logger.error(`Error sending email: ${error.message}`);
        return null;
    }
};
