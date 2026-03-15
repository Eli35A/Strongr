import mongoose, { Schema, Document } from 'mongoose';

export interface Goal extends Document {
    author: mongoose.Types.ObjectId;
    text: string;
    completed: boolean;
    createdAt: Date;
}

const GoalSchema: Schema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<Goal>('Goal', GoalSchema);
