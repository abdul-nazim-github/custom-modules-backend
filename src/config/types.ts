export interface AuthConfig {
    mongoUri: string;
    jwt: {
        accessSecret: string;
        accessTTL: string;
    };
    frontendUrl: string;
}
