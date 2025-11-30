import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: String,
    year: Number,
    plot: String,
    fullplot: String,
    genres: [String],
    cast: [String],
    directors: [String],
    countries: [String],
    runtime: Number,
    type: String,
    languages: [String],
    rated: String,
    awards: {
        wins: Number,
        nominations: Number,
        text: String
    },
    imdb: {
        rating: Number,
        votes: Number,
        id: Number
    },
    tomatoes: Object,
    lastupdated: String
}, { strict: false });


export const Movie = mongoose.model("Movie", movieSchema);
