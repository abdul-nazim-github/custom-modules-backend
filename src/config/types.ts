export interface AuthConfig {
    mongoUri: string;
    jwtSecret: string;
    sessionSecret: string;
    tokenExpiry?: string;
    // Add more configuration options here
}
