'use client';

import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 bg-[#141414]`}>
            <div className="px-4 md:px-16 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <h1 className="text-[#e50914] text-2xl font-bold cursor-pointer">NETFLESQUE</h1>
                </div>
            </div>
        </nav>
    );
}
