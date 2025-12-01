'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';

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
        <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-[#141414]' : 'bg-transparent'}`}>
            <div className="px-4 md:px-16 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <h1 className="text-[#e50914] text-2xl font-bold cursor-pointer">NETFLIX-ISH</h1>
                    <ul className="hidden md:flex space-x-4 text-sm text-gray-300">
                        <li className="cursor-pointer hover:text-white transition">Home</li>
                        <li className="cursor-pointer hover:text-white transition">TV Shows</li>
                        <li className="cursor-pointer hover:text-white transition">Movies</li>
                        <li className="cursor-pointer hover:text-white transition">New & Popular</li>
                        <li className="cursor-pointer hover:text-white transition">My List</li>
                    </ul>
                </div>
                <div className="flex items-center space-x-6 text-white">
                    <Search className="w-5 h-5 cursor-pointer" />
                    <Bell className="w-5 h-5 cursor-pointer" />
                    <div className="flex items-center space-x-2 cursor-pointer">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
