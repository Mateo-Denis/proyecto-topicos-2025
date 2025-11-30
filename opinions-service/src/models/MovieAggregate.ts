import mongoose, { Schema, Document } from 'mongoose';

export interface IMovieAggregate extends Document {
    movie_id: string;
    avg_rating: number;
    ratings_count: number;
}

const MovieAggregateSchema: Schema = new Schema({
    movie_id: { type: String, required: true, unique: true },
    avg_rating: { type: Number, default: 0 },
    ratings_count: { type: Number, default: 0 }
});

export default mongoose.model<IMovieAggregate>('MovieAggregate', MovieAggregateSchema);
