import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config({ path: "/run/secrets/movies_service_env" });


const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};
