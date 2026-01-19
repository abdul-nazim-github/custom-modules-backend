import nodemailer from 'nodemailer';
import { logger } from './logger.js';

export const sendResetEmail = async (config: any, to: string, resetLink: string) => {
    // Simplest possible Gmail configuration - let nodemailer handle the defaults
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.user,
            pass: config.pass,
        },
        debug: true,
        logger: true,
        connectionTimeout: 60000,
        greetingTimeout: 60000,
        socketTimeout: 60000,
    });
    try {
        await transporter.verify();
        logger.info('SMTP connection verified successfully');
    } catch (verifyError) {
        logger.error(`SMTP Verification Failed: ${verifyError}`);
    }

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
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Reset email sent successfully: ${info.messageId}`);
    } catch (error: any) {
        logger.error('--- DETAILED EMAIL ERROR ---');
        logger.error(`Error Code: ${error.code}`);
        logger.error(`Error Message: ${error.message}`);
        logger.error(`Full Error: ${JSON.stringify(error)}`);
        logger.error('----------------------------');
        throw new Error('Failed to send reset email');
    }
};
