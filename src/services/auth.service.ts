import bcrypt from 'bcrypt';
import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { Role, RolePermissions } from '../config/roles.js';

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
        role?: Role;
        device: { ip: string; userAgent: string };
    }) {
        const existing = await this.userRepository.findByEmail(payload.email);
        if (existing) {
            if (existing.deleted_at) {
                throw new Error('User has been blocked or deleted. Please contact super admin.');
            }
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(payload.password, 12);

        const userRole = payload.role || Role.USER;
        const defaultPermissions = RolePermissions[userRole] || [];

        const user = await this.userRepository.create({
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
            role: [userRole],
            permissions: defaultPermissions
        });

        return {
            message: 'User registered successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.get('role'),
                permissions: user.get('permissions'),
                created_at: (user as any).created_at
            }
        };
    }
}
