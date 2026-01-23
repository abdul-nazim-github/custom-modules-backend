import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ContactModule } from './index.js';
import { logger } from './utils/logger.js';
import { startKeepAlive } from './utils/ping.util.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3011;

app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/contact-db';

const contactModule = ContactModule.init();
app.use('/api', contactModule.router);

// Health check endpoint for keep-alive
app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'pong', success: true });
});

const start = async () => {
    try {
        logger.info('📝 Change Log initiated successfully. It can be disabled from env => REQUEST_LOG="false"');
        logger.info('📝 Request Logging is enabled. It can be disabled from env => REQUEST_LOG="false"');
        console.log(`Application is running on http://localhost:${port}`);
        await mongoose.connect(mongoUri);
        logger.info('💾 Database connected successfully');

        app.listen(port, () => {
            const externalUrl = process.env.RENDER_EXTERNAL_URL;
            if (externalUrl) {
                const baseUrl = externalUrl.endsWith('/') ? externalUrl.slice(0, -1) : externalUrl;
                startKeepAlive(`${baseUrl}/api/ping`);
            } else {
                logger.info('RENDER_EXTERNAL_URL not set. Skipping self-pinging.');
            }
        });
    } catch (error) {
        logger.error(`Error starting server: ${error}`);
        process.exit(1);
    }
};

start();
