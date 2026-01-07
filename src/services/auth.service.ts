import { AuthConfig } from '../config/types.js';

export class AuthService {
    private config: AuthConfig;

    constructor(config: AuthConfig) {
        this.config = config;
    }

    public async login() {
        return { message: 'Login logic here' };
    }

    public async register() {
        return { message: 'Register logic here' };
    }
}
