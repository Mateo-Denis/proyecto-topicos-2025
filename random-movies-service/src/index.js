import express from "express";
import cors from "cors";
import morgan from "morgan";
import randomRouter from "./routes/random.js";

export function createApp() {
    const app = express();
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use("/", randomRouter);
    return app;
}

const PORT = process.env.PORT || 3002;

if (process.argv[1] === new URL(import.meta.url).pathname) {
    const app = createApp();
    app.listen(PORT, () => {
        console.log(`Random Movies Service running on port ${PORT}`);
    });
}
