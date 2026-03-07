import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Comment extends Document {
    post: Types.ObjectId;
    author: Types.ObjectId;
    content: string;
}

const CommentSchema: Schema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<Comment>('Comment', CommentSchema);
