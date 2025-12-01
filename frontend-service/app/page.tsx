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

  // Check if a poster URL is accessible
  async function hasPoster(poster: string | null | undefined) {
    if (!poster) return false;
    try {
      const response = await fetch(poster, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Helper to deduplicate movies by title
  const deduplicateMovies = (movies: Movie[]) => {
    const seen = new Set<string>();
    return movies.filter((movie) => {
      if (seen.has(movie.title)) {
        return false;
      }
      seen.add(movie.title);
      return true;
    });
  };

  // Validate and replace movies with broken posters
  const validateAndReplaceBrokenPosters = async (
    movies: Movie[],
    category: 'trending' | 'action' | 'comedy' | 'recommended' | 'featured',
    setter: React.Dispatch<React.SetStateAction<Movie[]>>
  ) => {
    const validatedMovies: Movie[] = [];

    for (const movie of movies) {
      const posterValid = await hasPoster(movie.poster);

      if (posterValid) {
        validatedMovies.push(movie);
      } else {
        // Try to find a replacement
        const replacement = await fetchReplacementMovie(category, validatedMovies.map(m => m._id));
        if (replacement) {
          validatedMovies.push(replacement);
        }
      }
    }

    setter(validatedMovies);
  };

  // Validate and replace hero movie if poster is broken
  const validateAndReplaceHero = async () => {
    if (!heroMovie) return;

    const posterValid = await hasPoster(heroMovie.poster);

    if (!posterValid) {
      // Try to find a replacement hero
      for (let i = 0; i < 5; i++) {
        const candidates = await api.random.getFeatured(1, undefined, true);
        if (candidates && candidates.length > 0) {
          const candidate = candidates[0];
          const candidatePosterValid = await hasPoster(candidate.poster);
          if (candidatePosterValid) {
            setHeroMovie(candidate);
            return;
          }
        }
      }
    }
  };

  // Fetch a replacement movie for a specific category
  const fetchReplacementMovie = async (
    category: 'trending' | 'action' | 'comedy' | 'recommended' | 'featured',
    excludeIds: string[]
  ): Promise<Movie | null> => {
    try {
      let genre: string | undefined;

      // Map category to genre filter
      switch (category) {
        case 'action':
          genre = 'Action';
          break;
        case 'comedy':
          genre = 'Comedy';
          break;
        case 'trending':
        case 'recommended':
        case 'featured':
        default:
          genre = undefined; // No genre filter for these categories
          break;
      }

      // Try up to 5 times to find a valid replacement
      for (let i = 0; i < 5; i++) {
        const candidates = await api.random.getFeatured(1, genre, true);
        if (candidates && candidates.length > 0) {
          const candidate = candidates[0];
          if (!excludeIds.includes(candidate._id)) {
            const posterValid = await hasPoster(candidate.poster);
            if (posterValid) {
              return candidate;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching replacement:', error);
      return null;
    }
  };

  // Handle movie poster error - fetch replacement
  const handleMovieError = async (
    category: 'trending' | 'action' | 'comedy' | 'recommended' | 'featured',
    movieId: string
  ) => {
    try {
      let genre: string | undefined;
      let setter: React.Dispatch<React.SetStateAction<Movie[]>>;
      let currentMovies: Movie[];

      switch (category) {
        case 'trending':
          setter = setTrendingMovies;
          currentMovies = trendingMovies;
          break;
        case 'action':
          setter = setActionMovies;
          currentMovies = actionMovies;
          genre = 'Action';
          break;
        case 'comedy':
          setter = setComedyMovies;
          currentMovies = comedyMovies;
          genre = 'Comedy';
          break;
        case 'recommended':
          setter = setRecommendedMovies;
          currentMovies = recommendedMovies;
          break;
        case 'featured':
          setter = setFeaturedMovies;
          currentMovies = featuredMovies;
          break;
        default:
          return;
      }

      // Get all current movie IDs to avoid duplicates
      const existingIds = new Set(currentMovies.map(m => m._id));

      // Fetch replacement - keep trying until we get a unique one (max 5 attempts)
      let replacement: Movie | null = null;
      let attempts = 0;
      while (!replacement && attempts < 5) {
        const candidates = await api.random.getFeatured(1, genre, true);
        if (candidates && candidates.length > 0 && !existingIds.has(candidates[0]._id)) {
          replacement = candidates[0];
        }
        attempts++;
      }

      if (replacement) {
        // Replace the failed movie
        setter(currentMovies.map(m => m._id === movieId ? replacement! : m));
      } else {
        // If we can't find a replacement, just remove the failed one
        setter(currentMovies.filter(m => m._id !== movieId));
      }
    } catch (error) {
      console.error('Error replacing movie:', error);
    }
  };

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
        setFeaturedMovies(deduplicateMovies(randomFeatured));

        // 3. Fetch Catalog Rows (Movies Service)
        // In a real app, we'd have specific endpoints or filters for these
        const trending = await api.movies.getAll(1, 10, true);
        setTrendingMovies(deduplicateMovies(trending));

        // Fetch genre-specific sections using random endpoint for variety
        const action = await api.random.getFeatured(10, 'Action', true);
        setActionMovies(deduplicateMovies(action));

        const comedy = await api.random.getFeatured(10, 'Comedy', true);
        setComedyMovies(deduplicateMovies(comedy));

        // 4. Fetch Recommended (Placeholder + Event Trigger)
        // Triggering the "event" for the recommender service
        console.log('[EVENT] User visited Home. Triggering recommendation engine update...');
        // In the future, this would be: await api.events.emit('recommendations.requested', { userId: 'current-user' });

        // For now, using random movies as recommendations
        const recommended = await api.random.getFeatured(10);
        setRecommendedMovies(deduplicateMovies(recommended));

        setLoading(false);

        // After initial load, validate posters in the background and replace broken ones
        setTimeout(async () => {
          await validateAndReplaceHero();
          await validateAndReplaceBrokenPosters(deduplicateMovies(randomFeatured), 'featured', setFeaturedMovies);
          await validateAndReplaceBrokenPosters(deduplicateMovies(trending), 'trending', setTrendingMovies);
          await validateAndReplaceBrokenPosters(deduplicateMovies(action), 'action', setActionMovies);
          await validateAndReplaceBrokenPosters(deduplicateMovies(comedy), 'comedy', setComedyMovies);
          await validateAndReplaceBrokenPosters(deduplicateMovies(recommended), 'recommended', setRecommendedMovies);
        }, 100);
      } catch (error) {
        console.error('Error fetching data:', error);
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

      <div className="mt-[-80px] md:mt-[-120px] relative z-20 pl-4 md:pl-16 space-y-8">
        <MovieRow
          title="Featured"
          movies={featuredMovies}
        />
        <MovieRow
          title="Trending Now"
          movies={trendingMovies}
        />
        <MovieRow
          title="Recommended for You"
          movies={recommendedMovies}
        />
        <MovieRow
          title="Action Thrillers"
          movies={actionMovies}
        />
        <MovieRow
          title="Comedies"
          movies={comedyMovies}
        />
      </div>
    </main>
  );
}
