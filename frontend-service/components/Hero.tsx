'use client';

import { Play, Info } from 'lucide-react';
import { Movie } from '@/lib/api';

interface HeroProps {
    movie: Movie | null;
}

export default function Hero({ movie }: HeroProps) {
    if (!movie) return null;

    return (
        <div className="relative h-[56.25vw] max-h-[80vh] w-full">
            {/* Background Image Placeholder - using a gradient since we don't have real poster URLs usually */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black via-transparent to-transparent z-0">
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900 opacity-60" />
                )}
            </div>

            <div className="absolute top-[30%] md:top-[40%] left-4 md:left-16 w-full md:w-[40%] z-10 space-y-4">
                <h1 className="text-2xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {movie.title}
                </h1>
                <p className="text-white text-xs md:text-lg drop-shadow-md line-clamp-3">
                    {movie.plot}
                </p>
                <div className="flex space-x-3">
                    <button className="bg-white text-black px-4 py-2 md:px-6 md:py-2 rounded flex items-center hover:bg-opacity-80 transition font-bold">
                        <Play className="w-4 h-4 md:w-6 md:h-6 mr-2 fill-black" />
                        Play
                    </button>
                    <button className="bg-gray-500 bg-opacity-50 text-white px-4 py-2 md:px-6 md:py-2 rounded flex items-center hover:bg-opacity-40 transition font-bold">
                        <Info className="w-4 h-4 md:w-6 md:h-6 mr-2" />
                        More Info
                    </button>
                </div>
            </div>

            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#141414] to-transparent" />
        </div>
    );
}
