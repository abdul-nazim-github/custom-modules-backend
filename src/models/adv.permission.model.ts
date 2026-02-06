import { Schema, model, Document } from 'mongoose';

export interface IAdvPermission extends Document {
    name: string;
    permissions: string[];
    metadata: Record<string, any>;
    status: number;
    created_at: Date;
    updated_at: Date;
}

const AdvPermissionSchema = new Schema({
    name: { type: String, required: true, unique: true },
    permissions: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
    status: { type: Number, default: 1 }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
});

export const AdvPermissionModel = model<IAdvPermission>('AdvPermission', AdvPermissionSchema);
