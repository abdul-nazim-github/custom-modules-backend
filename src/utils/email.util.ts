import { Resend } from 'resend';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required in environment variables');
}

if (!process.env.RESEND_FROM_EMAIL) {
    logger.warn('RESEND_FROM_EMAIL not set, using default: onboarding@resend.dev');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Use environment variable or fallback to Resend's test domain
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Auth Module <onboarding@resend.dev>';

export const sendResetEmail = async (
    config: any,  // Keep this parameter for compatibility
    to: string,
    resetLink: string
) => {
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color:#4CAF50;color:#fff;padding:14px 25px;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
      </div>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 15 minutes.</p>
    </div>
  `;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: 'Password Reset Request',
            html: emailHtml,
        });

        if (error) {
            logger.error(`Resend email error: ${JSON.stringify(error)}`);
            throw new Error(`Resend API error: ${error.message}`);
        }

        logger.info(`Reset email sent via Resend. ID: ${data?.id}, To: ${to}`);
        return data;
    } catch (error: any) {
        logger.error(`Failed to send reset email: ${error.message || error}`);
        throw new Error(`Failed to send reset email: ${error.message}`);
    }
};

/* SMTP CODE (Commented out due to Render port blocking)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: config.user,
        pass: config.pass,
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    },
    debug: true, 
    logger: true,
    connectionTimeout: 60000, 
    greetingTimeout: 60000,
    socketTimeout: 60000,
});

const mailOptions = {
    from: config.from,
    to,
    subject: 'Password Reset Request',
    html: emailHtml,
};

try {
    await transporter.sendMail(mailOptions);
    logger.info(`Reset email sent to ${to}`);
} catch (error) {
    logger.error(`Failed to send reset email to ${to}: ${error}`);
    throw new Error('Failed to send reset email');
}
*/
