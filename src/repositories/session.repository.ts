import { SessionModel, Session } from '../models/session.model.js';
import { Document } from 'mongoose';

export class SessionRepository {
    async create(data: Partial<Session>): Promise<Session & Document> {
        return await SessionModel.create(data);
    }

    async findByRefreshTokenHash(hash: string): Promise<(Session & Document) | null> {
        return await SessionModel.findOne({ refreshTokenHash: hash, isActive: true });
    }

    async findAndLock(hash: string): Promise<(Session & Document) | null> {
        return await SessionModel.findOneAndUpdate(
            { refreshTokenHash: hash, isActive: true, concurrencyLock: null },
            { concurrencyLock: new Date().toISOString() },
            { new: true }
        );
    }

    async updateWithRotation(sessionId: any, data: Partial<Session>): Promise<void> {
        await SessionModel.findByIdAndUpdate(sessionId, {
            ...data,
            concurrencyLock: null // Release lock
        });
    }

    async deactivateAllForUser(userId: string): Promise<void> {
        await SessionModel.updateMany({ userId, isActive: true }, { isActive: false });
    }

    async deactivateByHash(hash: string): Promise<void> {
        await SessionModel.updateOne({ refreshTokenHash: hash, isActive: true }, { isActive: false });
    }

    async deactivateById(sessionId: string): Promise<void> {
        await SessionModel.findByIdAndUpdate(sessionId, { isActive: false });
    }
}
