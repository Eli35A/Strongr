import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Post extends Document {
    author: Types.ObjectId;
    content: string;
    image?: string;
    images: string[];
    likes: Types.ObjectId[];
    embedding?: number[];
}

const PostSchema: Schema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    image: { type: String },
    images: { type: [String], default: [] },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    embedding: { type: [Number], select: false }
}, {
    timestamps: true
});

export default mongoose.model<Post>('Post', PostSchema);
