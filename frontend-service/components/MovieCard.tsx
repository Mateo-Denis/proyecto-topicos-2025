'use client';

import { useState } from 'react';
import { Movie } from '@/lib/api';
import { Star, Play, Plus, ChevronDown } from 'lucide-react';
import RatingModal from './RatingModal';
import MoviePoster from './MoviePoster';

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);

    return (
        <>
            <div
                className="relative w-[200px] h-[300px] bg-[#2f2f2f] rounded cursor-pointer transition-all duration-300 hover:scale-110 hover:z-20 flex-shrink-0 overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <MoviePoster
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full rounded"
                />

                {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/80 to-transparent rounded flex flex-col justify-end p-4 animate-fadeIn">
                        <div className="space-y-2">
                            <h3 className="text-white font-bold text-sm line-clamp-2">{movie.title}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500 text-xs font-bold">{movie.imdb?.rating || 'N/A'} ★</span>
                                <span className="text-gray-400 text-xs border border-gray-400 px-1">{movie.year}</span>
                            </div>
                            <div className="flex space-x-2 text-xs text-white">
                                {movie.genres?.slice(0, 2).join(' • ')}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                            <div className="flex space-x-2">
                                <button
                                    className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white text-gray-400 hover:text-white transition"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowRatingModal(true);
                                    }}
                                >
                                    <Star className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                movieId={movie._id}
                movieTitle={movie.title}
            />
        </>
    );
}
