export const logger = {
    info: (message: string) => {
        console.log(`[${new Date().toISOString()}] info - ${message}`);
    },
    warn: (message: string) => {
        console.warn(`[${new Date().toISOString()}] warn - ${message}`);
    },
    error: (message: string) => {
        console.error(`[${new Date().toISOString()}] error - ${message}`);
    }
};
