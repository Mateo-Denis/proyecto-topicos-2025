'use client';

import { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';

interface MoviePosterProps {
    src?: string;
    alt: string;
    className?: string;
}

export default function MoviePoster({ src, alt, className }: MoviePosterProps) {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showError, setShowError] = useState(false);
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
        setIsLoading(true);
        setShowError(false);

        // Clear any existing timeout
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = null;
        }

        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, [src]);

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);

        // Delay showing the error UI to give slow images time to load
        errorTimeoutRef.current = setTimeout(() => {
            setShowError(true);
        }, 10000); // 10 second grace period
    };

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
        setShowError(false);

        // Clear error timeout if image loads successfully
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = null;
        }
    };

    // Only show fallback if src is missing OR if error occurred AND grace period expired
    if (!src || (hasError && showError)) {
        return (
            <div className={`bg-[#2f2f2f] flex flex-col items-center justify-center text-gray-500 p-4 text-center ${className}`}>
                <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs">{alt}</span>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-[#2f2f2f] animate-pulse" />
            )}
            <img
                src={imgSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={handleError}
                onLoad={handleLoad}
            />
        </div>
    );
}
