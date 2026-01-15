import crypto from 'crypto';
import { Types } from 'mongoose';
import { SessionRepository } from '../repositories/session.repository.js';
import { AuthConfig } from '../config/types.js';

export class SessionService {
    private sessionRepository: SessionRepository;
    private config: AuthConfig;

    constructor(sessionRepository: SessionRepository, config: AuthConfig) {
        this.sessionRepository = sessionRepository;
        this.config = config;
    }
    async createSession(userId: Types.ObjectId, device: { ip: string; userAgent: string }) {
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const session = await this.sessionRepository.create({
            userId,
            refreshTokenHash,
            device,
            expiresAt: new Date(Date.now() + this.config.jwt.refreshTTLms),
            isActive: true
        });

        return { session, refreshToken };
    }

    async deactivateSession(sessionId: string) {
        await this.sessionRepository.deactivateById(sessionId);
    }

    async validateSession(sessionId: string) {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session || !session.isActive) {
            return null;
        }
        return session;
    }
}
