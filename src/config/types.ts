export interface AuthConfig {
    mongoUri: string;
    jwt: {
        accessSecret: string;
        accessTTL: string;
        refreshSecret: string;
        refreshTTLms: number;
        resetSecret: string;
        resetTTL: string;
    };
    sessionSecret: string;
    frontendUrl: string;
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
}
