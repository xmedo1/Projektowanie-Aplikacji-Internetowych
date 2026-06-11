import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

interface Screening {
  id: number;
  startTime: string;
  roomName: string;
  ticketPrice: number;
}

interface Movie {
  id: number;
  title: string;
  durationMinutes: number;
  screenings: Screening[];
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await api.get(`/movies/${id}`);
        setMovie(response.data);
      } catch (err) {
        console.error(err);
        setError('Nie udało się załadować danych o filmie.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-fg-muted">
        Pobieranie informacji...
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-page text-error gap-4">
        <p>{error || 'Nie znaleziono filmu'}</p>
        <div className="w-48">
          <Button onClick={() => navigate('/')}>Wróć do repertuaru</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-fg-default p-8">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-accent hover:underline flex items-center gap-2"
        >
          Wróć do repertuaru
        </button>

        <div className="flex flex-col md:flex-row gap-8 mb-12 rounded-2xl bg-card p-8 shadow-2xl">
          <img
            src={`/posters/${movie.id}.jpg`}
            alt={`Plakat filmu ${movie.title}`}
            className="aspect-[2/3] w-full md:w-64 rounded-lg object-cover shadow-md shrink-0 bg-input text-transparent"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/posters/no_poster.png';
            }}
          />
          <div>
            <h1 className="text-4xl font-bold text-accent mb-4">{movie.title}</h1>
            <p className="text-lg text-fg-muted mb-2">
              Czas trwania: {movie.durationMinutes} minut
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 border-b border-input pb-4">Wybierz seans</h2>

        {movie.screenings.length === 0 ? (
          <p className="text-fg-muted">Brak zaplanowanych seansów dla tego filmu.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {movie.screenings.map((screening) => (
              <div
                key={screening.id}
                className="flex flex-col justify-between rounded-xl bg-input p-6 shadow-md border border-transparent hover:border-accent transition-colors"
              >
                <div className="mb-4">
                  <div className="text-xl font-bold text-white mb-1">
                    {new Date(screening.startTime).toLocaleDateString('pl-PL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                  <div className="text-3xl font-black text-accent mb-3">
                    {new Date(screening.startTime).toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex justify-between text-sm text-fg-muted">
                    <span>
                      Sala: <span className="text-white font-medium">{screening.roomName}</span>
                    </span>
                    <span>
                      Cena:{' '}
                      <span className="text-white font-medium">
                        {(screening.ticketPrice / 100).toFixed(2)} zł
                      </span>
                    </span>
                  </div>
                </div>

                {user ? (
                  <Link
                    to={`/reservation/${screening.id}`}
                    className="block w-full rounded-lg bg-accent px-4 py-3 text-center font-bold text-fg-on-accent transition hover:bg-accent-hover"
                  >
                    Wybierz miejsca
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      alert('Musisz być zalogowany, aby zarezerwować bilet!');
                      navigate('/login');
                    }}
                    className="w-full rounded-lg bg-gray-600 px-4 py-3 text-center font-bold text-white cursor-not-allowed hover:bg-gray-500 transition"
                  >
                    Zaloguj się by kupić
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
