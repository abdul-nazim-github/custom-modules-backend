import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AuthModule } from './index.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3018;

app.use(express.json());

const authConfig = {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-db',
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
        accessTTL: process.env.JWT_ACCESS_TTL || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        refreshTTLms: parseInt(process.env.JWT_REFRESH_TTL_MS || '604800000'),
        resetSecret: process.env.JWT_RESET_SECRET || 'reset-secret',
        resetTTL: process.env.JWT_RESET_TTL || '15m'
    },
    sessionSecret: process.env.SESSION_SECRET || 'session-secret',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    email: {
        host: process.env.EMAIL_HOST || 'mail.smtp2go.com',
        port: parseInt(process.env.EMAIL_PORT || '2525'),
        user: process.env.EMAIL_USER || 'no-reply@my-mern-app.com',
        pass: process.env.EMAIL_PASS || 'AG@XDK6Kz55',
        from: process.env.EMAIL_FROM || 'ayan.ghosh@codeclouds.com'
    }
};

const authModule = AuthModule.init(authConfig);
app.use('/api', authModule.router);

const start = async () => {
    try {
        logger.info('📝 Request Logging is enabled. It can be disabled from env => REQUEST_LOG="false"');
        await mongoose.connect(authConfig.mongoUri);
        logger.info('💾 Database connected successfully');

        app.listen(port, () => {
            logger.info(`Application is running on http://localhost:${port}`);
        });
    } catch (error) {
        logger.error(`Error starting server: ${error}`);
        process.exit(1);
    }
};

start();
