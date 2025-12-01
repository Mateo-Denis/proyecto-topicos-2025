'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/lib/api';
import MovieCard from './MovieCard';

interface MovieRowProps {
    title: string;
    movies: Movie[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;

            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (!movies || !Array.isArray(movies) || movies.length === 0) return null;

    return (
        <div className="mb-8 px-4 md:px-16 group">
            <h2 className="text-white text-xl md:text-2xl font-bold mb-4 hover:text-[#e5e5e5] transition cursor-pointer">
                {title}
            </h2>

            <div className="relative group">
                <button
                    className="absolute left-0 top-0 bottom-0 z-40 bg-black bg-opacity-50 w-12 hover:bg-opacity-70 hidden group-hover:flex items-center justify-center transition"
                    onClick={() => scroll('left')}
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                <div
                    ref={rowRef}
                    className="flex space-x-4 overflow-x-scroll scrollbar-hide py-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie) => (
                        <MovieCard key={movie._id} movie={movie} />
                    ))}
                </div>

                <button
                    className="absolute right-0 top-0 bottom-0 z-40 bg-black bg-opacity-50 w-12 hover:bg-opacity-70 hidden group-hover:flex items-center justify-center transition"
                    onClick={() => scroll('right')}
                >
                    <ChevronRight className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    );
}
