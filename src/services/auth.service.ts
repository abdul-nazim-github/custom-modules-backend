import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { logger } from '../utils/logger.js';
import { Role, RolePermissions } from '../config/roles.js';

export class AuthService {
    private config: AuthConfig;
    private userRepository: UserRepository;
    private sessionRepository: SessionRepository;

    constructor(
        config: AuthConfig,
        userRepository: UserRepository,
        sessionRepository: SessionRepository
    ) {
        this.config = config;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }

    async register(payload: {
        email: string;
        password: string;
        name?: string;
        device: { ip: string; userAgent: string };
    }) {
        const existing = await this.userRepository.findByEmail(payload.email);
        if (existing) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(payload.password, 12);

        const user = await this.userRepository.create({
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
        });

        const userRole = (user.role as Role) || Role.USER;
        const effectivePermissions = Array.from(new Set([
            ...(RolePermissions[userRole] || []),
            ...(user.permissions || [])
        ]));

        return {
            message: 'User registered successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: userRole,
                permissions: effectivePermissions,
                created_at: (user as any).created_at
            }
        };
    }

    async login(payload: {
        email: string;
        password: string;
        device: { ip: string; userAgent: string };
    }) {
        const user = await this.userRepository.findByEmail(payload.email);
        if (!user) {
            logger.warn(`Failed login attempt: User not found for email ${payload.email}`);
            throw new Error('Invalid credentials');
        }

        if (!user.password) {
            logger.warn(`Failed login attempt: User ${payload.email} has no password set`);
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(payload.password, user.password);
        if (!isValid) {
            logger.warn(`Failed login attempt: Incorrect password for user ${payload.email}`);
            throw new Error('Invalid credentials');
        }

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const session = await this.sessionRepository.create({
            userId: user._id as Types.ObjectId,
            refreshTokenHash,
            device: payload.device,
            expiresAt: new Date(
                Date.now() + this.config.jwt.refreshTTLms
            ),
        });

        const accessToken = jwt.sign(
            { userId: user._id, sessionId: session._id },
            this.config.jwt.accessSecret,
            { expiresIn: this.config.jwt.accessTTL as any }
        );

        return {
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role || Role.USER,
                    permissions: Array.from(new Set([
                        ...(RolePermissions[(user.role as Role) || Role.USER] || []),
                        ...(user.permissions || [])
                    ]))
                }
            }
        };
    }

    async logout(payload: { sessionId: string }) {
        await this.sessionRepository.deactivateById(
            payload.sessionId
        );
        return {
            message: 'Logged out successfully'
        };
    }

}
