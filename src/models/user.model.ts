import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Schema, model, Document } from 'mongoose';

export class User {
    @IsEmail()
    @IsNotEmpty()
    email!: string;


    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    metadata?: Record<string, any>;
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, {
    timestamps: true,
    versionKey: false
});

export const UserModel = model<User & Document>('User', UserSchema);
