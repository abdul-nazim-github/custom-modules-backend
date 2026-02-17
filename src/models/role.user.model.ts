import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {

    name: string;
    permissions: string[];
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const RoleSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    permissions: { type: [String], default: [] },
    is_default: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
});

export const RoleModel = mongoose.model<IRole>('Role', RoleSchema, 'roles');