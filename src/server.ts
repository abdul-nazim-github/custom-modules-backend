import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { PasswordResetModule } from './index.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3018;

app.use(express.json());

const authConfig = {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-db',
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
        accessTTL: process.env.JWT_ACCESS_TTL || '15m'
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

const passwordResetModule = PasswordResetModule.init(authConfig);
app.use('/api', passwordResetModule.router);

const start = async () => {
    try {
        logger.info('📝 Change Log initiated successfully. It can be disabled from env => REQUEST_LOG="false"');
        logger.info('📝 Request Logging is enabled. It can be disabled from env => REQUEST_LOG="false"');
        console.log(`Application is running on http://localhost:${port}`);
        await mongoose.connect(authConfig.mongoUri);
        logger.info('💾 Database connected successfully');
        app.listen(port, () => {
        });
    } catch (error) {
        logger.error(`Error starting server: ${error}`);
        process.exit(1);
    }
};

start();
