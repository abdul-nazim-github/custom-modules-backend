import { IsNotEmpty, IsString, IsDate, IsBoolean, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Schema, model, Document, Types } from 'mongoose';

class DeviceInfo {
    @IsString()
    @IsNotEmpty()
    ip!: string;

    @IsString()
    @IsNotEmpty()
    userAgent!: string;
}

export class Session {
    @IsNotEmpty()
    userId!: Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    refreshTokenHash!: string;

    @Type(() => DeviceInfo)
    @IsObject()
    device!: DeviceInfo;

    @IsDate()
    @IsNotEmpty()
    expiresAt!: Date;

    @IsBoolean()
    @IsNotEmpty()
    isActive!: boolean;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    concurrencyLock?: string | null;
}

const SessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    device: {
        ip: { type: String, required: true },
        userAgent: { type: String, required: true }
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    isActive: { type: Boolean, default: true },
    concurrencyLock: { type: String, default: null },
}, {
    timestamps: true,
    versionKey: false
});

SessionSchema.index({ userId: 1, isActive: 1 });

export const SessionModel = model<Session & Document>('Session', SessionSchema);
