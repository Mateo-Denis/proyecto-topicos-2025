import express from "express";
import cors from "cors";
import moviesRouter from "./routes/movies.js";
import { connectDB } from "./db.js";

export function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use("/movies", moviesRouter);
    return app;
}

const PORT = process.env.PORT || 3001;

if (process.argv[1] === new URL(import.meta.url).pathname) {
    connectDB().then(() => {
        const app = createApp();
        app.listen(PORT, () => console.log(`Movies service running on port ${PORT}`));
    });
}
