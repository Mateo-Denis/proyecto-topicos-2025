import express from "express";
import cors from "cors";
import morgan from "morgan";
import randomRouter from "./routes/random.js";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/", randomRouter);

app.listen(PORT, () => {
    console.log(`Random Movies Service running on port ${PORT}`);
});
