'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { api } from '@/lib/api';

interface RatingModalProps {
    movieId: string;
    movieTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function RatingModal({ movieId, movieTitle, isOpen, onClose }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;

        setSubmitting(true);
        try {
            await api.rating.submit(movieId, rating, comment);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setRating(0);
                setComment('');
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to submit rating', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-[#181818] w-full max-w-md p-6 rounded-lg shadow-xl relative text-white">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold mb-4">Rate "{movieTitle}"</h2>

                {success ? (
                    <div className="text-green-500 text-center py-8">
                        <p className="text-lg font-bold">Rating Submitted!</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center space-x-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="w-full bg-[#333] text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-red-600"
                            rows={3}
                            placeholder="Write a review (optional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                            className={`w-full py-2 rounded font-bold transition ${rating === 0 || submitting
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-[#e50914] hover:bg-red-700 text-white'
                                }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
