import { Schema, model } from 'mongoose';

const ConfigSchema = new Schema({
    slug: { type: String, required: true, unique: true },
    permissions: { type: [String], default: [] }
}, { timestamps: true });

export const ConfigModel = model('Config', ConfigSchema);
