import mongoose, { Schema, Document } from 'mongoose';
export interface IPermission extends Document {
    name?: string;
    userId?: string;
    permissions: string[];
    created_at: Date;
    updated_at: Date;
}

const PermissionSchema: Schema = new Schema({
    name: { type: String, unique: true, sparse: true },
    userId: { type: String, unique: true, sparse: true },
    permissions: { type: [String], required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
});

export const PermissionModel = mongoose.model<IPermission>('PermissionModel', PermissionSchema);
