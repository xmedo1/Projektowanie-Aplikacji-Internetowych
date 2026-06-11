import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

interface Movie {
  id: number;
  title: string;
  durationMinutes: number;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Błąd podczas wylogowywania', error);
    }
  };

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
    <div className="min-h-screen bg-page text-fg-default p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between border-b border-input pb-6">
          <h1 className="text-3xl font-bold text-accent">Repertuar</h1>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <span className="text-fg-muted">
                  Zalogowano jako:{' '}
                  <button
                    onClick={() => navigate('/profile')}
                    className="font-bold text-accent hover:underline"
                  >
                    {user.firstName}
                  </button>
                </span>
                <div className="flex gap-4">
                  <div className="w-32">
                    <Button onClick={() => navigate('/profile')}>Mój profil</Button>
                  </div>
                  <div className="w-32">
                    <Button onClick={handleLogout}>Wyloguj</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-32">
                <Button onClick={() => navigate('/login')}>Zaloguj</Button>
              </div>
            )}
          </div>
        </div>
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
                  <div className="mb-5 flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-input text-fg-muted">
                    <span className="text-sm">Brak plakatu (todo)</span>
                  </div>
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
