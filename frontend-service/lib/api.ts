import axios from 'axios';

// Service URLs (assuming running locally or via docker-compose mapping)
// In a real browser environment, these would need to be proxied or CORS enabled
const MOVIES_SERVICE_URL = 'http://localhost:3001';
const RANDOM_MOVIES_SERVICE_URL = 'http://localhost:3002';
const RATING_SERVICE_URL = 'http://localhost:3003';

export interface Movie {
    _id: string;
    title: string;
    year: number;
    plot: string;
    poster?: string;
    genres: string[];
    directors: string[];
    imdb: {
        rating: number;
        votes: number;
    };
}

export const api = {
    movies: {
        getAll: async (page = 1, limit = 20) => {
            const response = await axios.get(`${MOVIES_SERVICE_URL}/movies`, {
                params: { page, limit }
            });
            return response.data.data;
        },
        getById: async (id: string) => {
            const response = await axios.get(`${MOVIES_SERVICE_URL}/movies/${id}`);
            return response.data;
        },
        search: async (query: string) => {
            const response = await axios.get(`${MOVIES_SERVICE_URL}/movies/search`, {
                params: { q: query }
            });
            return response.data;
        },
        filter: async (params: any) => {
            const response = await axios.get(`${MOVIES_SERVICE_URL}/movies/filter`, {
                params
            });
            return response.data;
        }
    },
    random: {
        getFeatured: async (limit = 1) => {
            const response = await axios.get(`${RANDOM_MOVIES_SERVICE_URL}/randommovies`, {
                params: { limit }
            });
            return response.data;
        }
    },
    rating: {
        submit: async (movieId: string, rating: number, comment?: string) => {
            const response = await axios.post(`${RATING_SERVICE_URL}/ratings`, {
                movie_id: movieId,
                rating,
                comment
            });
            return response.data;
        }
    }
};
