// import { Resend } from 'resend';
// import { logger } from './logger.js';
// import dotenv from 'dotenv';

// dotenv.config();

// // Validate required environment variables
// if (!process.env.RESEND_API_KEY) {
//     throw new Error('RESEND_API_KEY is required in environment variables');
// }

// if (!process.env.RESEND_FROM_EMAIL) {
//     logger.warn('RESEND_FROM_EMAIL not set, using default: onboarding@resend.dev');
// }

// const resend = new Resend(process.env.RESEND_API_KEY);

// // Use environment variable or fallback to Resend's test domain
// const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Auth Module <onboarding@resend.dev>';

// export const sendResetEmail = async (
//     config: any,  // Keep this parameter for compatibility
//     to: string,
//     resetLink: string
// ) => {
//     const emailHtml = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2>Password Reset Request</h2>
//       <p>You requested to reset your password. Click the button below to proceed:</p>
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${resetLink}" style="background-color:#4CAF50;color:#fff;padding:14px 25px;text-decoration:none;border-radius:5px;">
//           Reset Password
//         </a>
//       </div>
//       <p>If the button doesn't work, copy and paste this link:</p>
//       <p>${resetLink}</p>
//       <p>This link will expire in 15 minutes.</p>
//     </div>
//   `;

//     try {
//         const { data, error } = await resend.emails.send({
//             from: FROM_EMAIL,
//             to,
//             subject: 'Password Reset Request',
//             html: emailHtml,
//         });

//         if (error) {
//             logger.error(`Resend email error: ${JSON.stringify(error)}`);
//             throw new Error(`Resend API error: ${error.message}`);
//         }

//         logger.info(`Reset email sent via Resend. ID: ${data?.id}, To: ${to}`);
//         return data;
//     } catch (error: any) {
//         logger.error(`Failed to send reset email: ${error.message || error}`);
//         throw new Error(`Failed to send reset email: ${error.message}`);
//     }
// };
import { logger } from './logger.js';
import nodemailer from 'nodemailer';

export const sendResetEmail = async (config: any, to: string, resetLink: string) => {
    const transporter = nodemailer.createTransport({
        service: config.service || undefined,
        host: config.host,
        port: config.port,
        secure: config.secure || false,
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


