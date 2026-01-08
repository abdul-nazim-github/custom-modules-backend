import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Schema, model, Document } from 'mongoose';

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
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false
    },
    versionKey: false
});

export const UserModel = model<User & Document>('User', UserSchema);
