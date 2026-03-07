import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
    username: string;
    email: string;
    password?: string;
    profileImage?: string;
    googleId?: string;
    facebookId?: string;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profileImage: { type: String, default: 'default-profile.png' },
    googleId: { type: String },
    facebookId: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<User>('User', UserSchema);
