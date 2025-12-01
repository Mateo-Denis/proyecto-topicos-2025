import express from "express";
import { Movie } from "../models/Movie.js";

const router = express.Router();

// GET /movies?page=&limit=
router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.poster === 'true') {
        query.poster = { $exists: true, $ne: null };
    }

    const [movies, total] = await Promise.all([
        Movie.find(query).sort({ year: -1 }).skip(skip).limit(limit),
        Movie.countDocuments(query)
    ]);

    res.json({
        data: movies,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// GET /movies/random
router.get("/random", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const { genre, poster } = req.query;

        const pipeline = [];

        const match = {};
        if (genre) match.genres = { $in: [new RegExp(genre, "i")] };
        if (poster === 'true') match.poster = { $exists: true, $ne: null };

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        pipeline.push({ $sample: { size: limit } });

        const movies = await Movie.aggregate(pipeline);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /movies/search?q=text
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

        const movies = await Movie.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { plot: { $regex: q, $options: "i" } },
                { fullplot: { $regex: q, $options: "i" } }
            ]
        }).limit(20);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /movies/filter?year=2000&genre=Action
router.get("/filter", async (req, res) => {
    try {
        const { year, genre, country, language } = req.query;
        const query = {};

        if (year) query.year = parseInt(year);
        if (req.query.minYear) {
            query.year = { ...query.year, $gte: parseInt(req.query.minYear) };
        }
        if (req.query.maxYear) {
            query.year = { ...query.year, $lte: parseInt(req.query.maxYear) };
        }
        if (genre) query.genres = { $in: [new RegExp(genre, "i")] };
        if (country) query.countries = { $in: [new RegExp(country, "i")] };
        if (language) query.languages = { $in: [new RegExp(language, "i")] };
        if (req.query.poster === 'true') {
            query.poster = { $exists: true, $ne: null };
        }

        // Original code had .limit(20). Let's respect that or use query limit.
        const limit = parseInt(req.query.limit) || 20;

        // Apply sorting by year descending here as well to be consistent
        const movies = await Movie.find(query).sort({ year: -1 }).limit(limit);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /movies/title/:title
router.get("/title/:title", async (req, res) => {
    try {
        const movie = await Movie.findOne({ title: { $regex: new RegExp(`^${req.params.title}$`, "i") } });
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /movies/director/:director
router.get("/director/:director", async (req, res) => {
    try {
        const movies = await Movie.find({ directors: { $in: [new RegExp(req.params.director, "i")] } }).limit(20);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /movies/:id
router.get("/:id", async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie)
            return res.status(404).json({ error: "Not found" });

        res.json(movie);
    } catch (err) {
        res.status(400).json({ error: "Invalid ID" });
    }
});

export default router;
