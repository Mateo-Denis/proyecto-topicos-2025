'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import { api, Movie } from '@/lib/api';

export default function Home() {
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Hero Movie (Random)
        const randomHero = await api.random.getFeatured(1);
        if (randomHero && randomHero.length > 0) {
          setHeroMovie(randomHero[0]);
        }

        // 2. Fetch Featured Row (Random)
        const randomFeatured = await api.random.getFeatured(10);
        setFeaturedMovies(randomFeatured);

        // 3. Fetch Catalog Rows (Movies Service)
        // In a real app, we'd have specific endpoints or filters for these
        const trending = await api.movies.getAll(1, 10);
        setTrendingMovies(trending);

        // Simulating genre filters by searching/filtering if backend supports it
        // For now, just fetching more pages to simulate variety
        const action = await api.movies.getAll(2, 10);
        setActionMovies(action);

        const comedy = await api.movies.getAll(3, 10);
        setComedyMovies(comedy);

        // 4. Fetch Recommended (Placeholder + Event Trigger)
        // Triggering the "event" for the recommender service
        console.log('[EVENT] User visited Home. Triggering recommendation engine update...');
        // In the future, this would be: await api.events.emit('recommendations.requested', { userId: 'current-user' });

        // For now, using random movies as recommendations
        const recommended = await api.random.getFeatured(10);
        setRecommendedMovies(recommended);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#e50914]"></div>
      </div>
    );
  }

  return (
    <main className="bg-[#141414] min-h-screen pb-16 overflow-hidden">
      <Navbar />
      <Hero movie={heroMovie} />

      <div className="mt-[-100px] md:mt-[-150px] relative z-20 pl-4 md:pl-16 space-y-8">
        <MovieRow title="Featured" movies={featuredMovies} />
        <MovieRow title="Trending Now" movies={trendingMovies} />
        <MovieRow title="Recommended for You" movies={recommendedMovies} />
        <MovieRow title="Action Thrillers" movies={actionMovies} />
        <MovieRow title="Comedies" movies={comedyMovies} />
      </div>
    </main>
  );
}
