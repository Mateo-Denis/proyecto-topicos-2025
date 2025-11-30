import mongoose, { Schema, Document } from 'mongoose';

export interface IOpinion extends Document {
    movie_id: string;
    rating: number;
    comment: string;
    received_at: Date;
    source: string;
    message_id: string; // For idempotency
}

const OpinionSchema: Schema = new Schema({
    movie_id: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    received_at: { type: Date, default: Date.now },
    source: { type: String },
    message_id: { type: String, unique: true } // Ensure uniqueness
});

export default mongoose.model<IOpinion>('Opinion', OpinionSchema);
