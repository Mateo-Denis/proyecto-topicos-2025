import express from "express";
import axios from "axios";

const router = express.Router();

const MOVIES_SERVICE_URL = process.env.MOVIES_SERVICE_URL || "http://movies-service:3001";

// GET /randommovies?limit=5
router.get("/randommovies", async (req, res) => {
    const limit = parseInt(req.query.limit);

    if (req.query.limit && (isNaN(limit) || limit <= 0)) {
        return res.status(400).json({ error: "Limit must be a positive integer" });
    }

    try {
        const response = await axios.get(`${MOVIES_SERVICE_URL}/movies/random`, {
            params: { limit: limit || 5 }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching random movies:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
