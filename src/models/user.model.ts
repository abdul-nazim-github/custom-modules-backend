import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { Schema, model, Document } from 'mongoose';

export class User {
    @IsEmail()
    @IsNotEmpty()
    email!: string;


    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password is too weak. It must contain at least one uppercase letter, one lower case letter, one number and one special character.',
    })
    password!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Name must be at least 3 characters long' })
    name!: string;

    @IsOptional()
    metadata?: Record<string, any>;

    @IsOptional()
    deleted_at?: Date;
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    deleted_at: { type: Date, default: null }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false
    },
    versionKey: false
});

export const UserModel = model<User & Document>('User', UserSchema);
