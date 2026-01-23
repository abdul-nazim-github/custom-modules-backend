import https from 'https';
import http from 'http';
import { logger } from './logger.js';

/**
 * Starts a keep-alive mechanism by pinging the specified URL every 2 minutes.
 * @param url The URL to ping.
 */
export const startKeepAlive = (url: string) => {
    if (!url) {
        logger.warn('Keep-alive URL not provided. Self-pinging disabled.');
        return;
    }

    const interval = 2 * 60 * 1000; // 2 minutes

    logger.info(`Keep-alive mechanism started. Pinging ${url} every 2 minutes.`);

    setInterval(() => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (res) => {
            if (res.statusCode === 200) {
                logger.info(`Keep-alive ping successful to ${url}: ${res.statusCode}`);
            } else {
                logger.warn(`Keep-alive ping to ${url} returned status: ${res.statusCode}`);
            }
        }).on('error', (err) => {
            logger.error(`Keep-alive ping to ${url} failed: ${err.message}`);
        });
    }, interval);
};
