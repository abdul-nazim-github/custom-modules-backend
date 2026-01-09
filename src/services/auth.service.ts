import bcrypt from 'bcrypt';
import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';

export class AuthService {
    private config: AuthConfig;
    private userRepository: UserRepository;

    constructor(
        config: AuthConfig,
        userRepository: UserRepository
    ) {
        this.config = config;
        this.userRepository = userRepository;
    }

    async register(payload: {
        email: string;
        password: string;
        name?: string;
        device: { ip: string; userAgent: string };
    }) {
        const hashedPassword = await bcrypt.hash(payload.password, 12);

        const user = await this.userRepository.create({
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
        });

        return {
            message: 'User registered successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                created_at: (user as any).created_at
            }
        };
    }
}
