import { useEffect, useState } from 'react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import type { Movie } from '../types';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get('/movies');
        setMovies(response.data);
      } catch (err) {
        console.error('Błąd pobierania filmów:', err);
        setError('Nie udało się załadować repertuaru.');
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchMovies();
  }, []);

  if (loadingMovies) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-fg-muted">
        Ładowanie filmów...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-error">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-10 border-b border-input pb-6 text-3xl font-bold text-accent">
          Repertuar
        </h1>
        {movies.length === 0 ? (
          <p className="mt-20 text-center text-lg text-fg-muted">Brak filmów w bazie danych.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
