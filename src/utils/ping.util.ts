import { logger } from './logger.js';

export const startKeepAlive = (url: string) => {
    setInterval(async () => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                logger.info(`Successfully pinged ${url}`);
            } else {
                logger.warn(`Failed to ping ${url}: ${response.statusText}`);
            }
        } catch (error) {
            logger.error(`Error during ping to ${url}: ${error}`);
        }
    }, 14 * 60 * 1000); // 14 minutes
};
