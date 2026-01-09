import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Schema, model, Document } from 'mongoose';
import { Role } from '../config/roles.js';

export class User {
    @IsEmail()
    @IsNotEmpty()
    email!: string;


    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    metadata?: Record<string, any>;

    @IsString()
    @IsOptional()
    role?: Role;

    @IsOptional()
    permissions?: string[];
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    permissions: { type: [String], default: [] }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false
    },
    versionKey: false
});

export const UserModel = model<User & Document>('User', UserSchema);
