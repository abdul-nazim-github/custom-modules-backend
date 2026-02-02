import { Mongoose, Schema } from "mongoose";
export interface IRoleUser extends Document {
    name:string;
    role:string;
    permissions:string[];
    slug:string;
    created_at: Date;
    updated_at: Date;
}

const RoleUserSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    permissions: { type: [String], required: true },
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
});

export const RoleUserModel = (mongoose: Mongoose) => mongoose.model<IRoleUser>('RoleUser', RoleUserSchema, 'role_users');