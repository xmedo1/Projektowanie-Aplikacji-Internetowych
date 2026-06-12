import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

interface Movie {
  id: number;
  title: string;
  durationMinutes: number;
}

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
    <div className="p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-10 border-b border-input pb-6 text-3xl font-bold text-accent">
          Repertuar
        </h1>
        {movies.length === 0 ? (
          <p className="text-center text-fg-muted mt-20 text-lg">Brak filmów w bazie danych.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex flex-col justify-between rounded-xl bg-card p-5 shadow-xl transition-transform hover:-translate-y-2"
              >
                <div>
                  <img
                    src={`/posters/${movie.id}.jpg`}
                    alt={`Plakat filmu ${movie.title}`}
                    className="mb-5 aspect-[2/3] w-full rounded-lg object-cover shadow-lg"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/posters/no_poster.png';
                    }}
                  />
                  <h2 className="mb-2 text-xl font-bold text-fg-default">{movie.title}</h2>
                  <p className="text-sm text-fg-muted">Czas trwania: {movie.durationMinutes} min</p>
                </div>
                <Link
                  to={`/movie/${movie.id}`}
                  className="mt-6 block w-full rounded-lg bg-accent px-4 py-3 text-center font-bold text-fg-on-accent transition hover:bg-accent-hover"
                >
                  Zobacz seanse
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
