import nodemailer from 'nodemailer';
import { logger } from './logger.js';

export const sendResetEmail = async (config: any, to: string, resetLink: string) => {
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });

    const mailOptions = {
        from: config.from,
        to,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the button below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>${resetLink}</p>
                <p>This link will expire soon. If you didn't request this, please ignore this email.</p>
            </div>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Reset email sent to ${to}`);
    } catch (error) {
        logger.error(`Failed to send reset email to ${to}: ${error}`);
        throw new Error('Failed to send reset email');
    }
};
