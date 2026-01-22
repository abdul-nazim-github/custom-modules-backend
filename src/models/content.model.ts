import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Schema, model, Document } from 'mongoose';

export class Content {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    shortDescription!: string;

    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsNumber()
    @IsOptional()
    status?: number;

    @IsOptional()
    _id?: any;

    @IsOptional()
    id?: any;

    @IsOptional()
    created_at?: Date;

    @IsOptional()
    updated_at?: Date;
}

const ContentSchema = new Schema({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: Number, default: 1 }, // 1 for active, 0 for inactive
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
});

export const ContentModel = model<Content & Document>('Content', ContentSchema);
