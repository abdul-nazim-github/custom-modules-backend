export interface AuthConfig {
    mongoUri: string;
    jwt: {
        accessSecret: string;
        accessTTL: string;
        refreshSecret: string;
        refreshTTLms: number;
    };
    sessionSecret: string;
}
