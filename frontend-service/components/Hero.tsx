'use client';

import { Play, Info } from 'lucide-react';
import { Movie } from '@/lib/api';
import MoviePoster from './MoviePoster';

interface HeroProps {
    movie: Movie | null;
}

export default function Hero({ movie }: HeroProps) {
    if (!movie) return null;

    return (
        <div className="relative h-[56.25vw] max-h-[80vh] w-full">
            {/* Background Image Placeholder - using a gradient since we don't have real poster URLs usually */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black via-transparent to-transparent z-0">
                <MoviePoster
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full opacity-60"
                />
            </div>

            <div className="absolute top-[30%] md:top-[40%] left-4 md:left-16 w-full md:w-[40%] z-10 space-y-4">
                <h1 className="text-2xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {movie.title}
                </h1>
                <p className="text-white text-xs md:text-lg drop-shadow-md line-clamp-3">
                    {movie.plot}
                </p>
            </div>

            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#141414] to-transparent" />
        </div>
    );
}
