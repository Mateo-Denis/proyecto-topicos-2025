'use client';

import { useState } from 'react';
import { Movie } from '@/lib/api';
import { Star, Play, Plus, ChevronDown } from 'lucide-react';
import RatingModal from './RatingModal';

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);

    return (
        <>
            <div
                className="relative w-[200px] h-[300px] bg-[#2f2f2f] rounded cursor-pointer transition-all duration-300 hover:scale-110 hover:z-20 flex-shrink-0"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover rounded"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 p-4 text-center">
                        {movie.title}
                    </div>
                )}

                {isHovered && (
                    <div className="absolute inset-0 bg-[#181818] p-4 rounded shadow-xl flex flex-col justify-between animate-fadeIn">
                        <div>
                            <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{movie.title}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-green-500 text-xs font-bold">{movie.imdb?.rating || 'N/A'} Match</span>
                                <span className="text-gray-400 text-xs border border-gray-400 px-1">{movie.year}</span>
                            </div>
                            <div className="flex space-x-2 text-xs text-white mb-2">
                                {movie.genres?.slice(0, 2).join(' • ')}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                                <button className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-gray-200">
                                    <Play className="w-3 h-3 fill-black text-black" />
                                </button>
                                <button className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white text-gray-400 hover:text-white">
                                    <Plus className="w-3 h-3" />
                                </button>
                                <button
                                    className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white text-gray-400 hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowRatingModal(true);
                                    }}
                                >
                                    <Star className="w-3 h-3" />
                                </button>
                            </div>
                            <button className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white text-gray-400 hover:text-white">
                                <ChevronDown className="w-3 h-3" />
                            </button>
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
