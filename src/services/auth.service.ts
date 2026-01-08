import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Types } from 'mongoose';

import { AuthConfig } from '../config/types.js';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { logger } from '../utils/logger.js';

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

        return {
            message: 'User registered successfully',
            data: user
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

        const accessToken = jwt.sign(
            { userId: user._id },
            this.config.jwt.accessSecret,
            { expiresIn: this.config.jwt.accessTTL as any }
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        await this.sessionRepository.create({
            userId: user._id as Types.ObjectId,
            refreshTokenHash,
            device: payload.device,
            expiresAt: new Date(
                Date.now() + this.config.jwt.refreshTTLms
            ),
        });

        return {
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
            }
        };
    }

    async refresh(payload: {
        refreshToken: string;
        device: { ip: string; userAgent: string };
    }) {
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(payload.refreshToken)
            .digest('hex');

        const session = await this.sessionRepository.findAndLock(refreshTokenHash);

        if (!session) {
            logger.warn(`Failed refresh attempt: Invalid or expired refresh token (Hash: ${refreshTokenHash})`);
            throw new Error('Invalid or expired refresh token');
        }

        // Generate new tokens
        const accessToken = jwt.sign(
            { userId: session.userId },
            this.config.jwt.accessSecret,
            { expiresIn: this.config.jwt.accessTTL as any }
        );

        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const newRefreshTokenHash = crypto
            .createHash('sha256')
            .update(newRefreshToken)
            .digest('hex');

        // Rotate token: Update session with new hash and release lock
        await this.sessionRepository.updateWithRotation(session._id, {
            refreshTokenHash: newRefreshTokenHash,
            device: payload.device,
            expiresAt: new Date(Date.now() + this.config.jwt.refreshTTLms)
        });

        return {
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            }
        };
    }
}
