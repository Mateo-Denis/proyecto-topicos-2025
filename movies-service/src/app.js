import express from "express";
import cors from "cors";
import moviesRouter from "./routes/movies.js";
import { connectDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/movies", moviesRouter);

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Movies service running on port ${PORT}`));
});
