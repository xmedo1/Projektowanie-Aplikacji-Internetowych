import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { useNotification } from '../context/NotificationContext';
import { isAxiosError } from 'axios';
import type { Movie } from '../types';

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editingMovieId, setEditingMovieId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const response = await api.get('/movies');
        setMovies(response.data);
      } catch (err) {
        console.error('Błąd pobierania filmów:', err);
        showNotification('Nie udało się pobrać listy filmów.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [refreshKey, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMovieId) {
      try {
        await api.put(`/movies/${editingMovieId}`, {
          title,
          durationMinutes: parseInt(durationMinutes),
        });
        showNotification('Pomyślnie zaktualizowano');
        handleCancelEdit();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        if (isAxiosError(error)) {
          showNotification(error.response?.data?.error || 'Błąd aktualizacji filmu', 'error');
        }
      }
    } else {
      try {
        await api.post('/movies', {
          title,
          durationMinutes: parseInt(durationMinutes),
        });
        showNotification('Pomyślnie dodano film do bazy');
        setTitle('');
        setDurationMinutes('');
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        if (isAxiosError(error)) {
          showNotification(error.response?.data?.error || 'Błąd dodawania filmu', 'error');
        }
      }
    }
  };

  const handleEditClick = (movie: Movie) => {
    setEditingMovieId(movie.id);
    setTitle(movie.title);
    setDurationMinutes(movie.durationMinutes.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMovieId(null);
    setTitle('');
    setDurationMinutes('');
  };

  const handleDeleteMovie = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten film z bazy?')) return;

    try {
      await api.delete(`/movies/${id}`);
      showNotification('Film został usunięty.');

      if (editingMovieId === id) {
        handleCancelEdit();
      }

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      if (isAxiosError(error)) {
        showNotification(error.response?.data?.error || 'Błąd usuwania filmu', 'error');
      }
    }
  };

  if (loading) return <div className="p-8 text-fg-muted">Ładowanie bazy filmów...</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between border-b border-input pb-4">
          <div>
            <h1 className="text-3xl font-black text-fg-default">Zarządzanie Filmami</h1>
            <p className="mt-2 text-fg-muted">Dodawaj, edytuj, usuwaj filmy w bazie danych.</p>
          </div>
          <div className="w-32">
            <Button onClick={() => navigate('/admin')}>Wróć</Button>
          </div>
        </div>
        <div className="mb-10 rounded-xl border border-input bg-card p-6 shadow-md transition-colors">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-accent">
              {editingMovieId ? 'Edytujesz film' : 'Dodaj nowy film'}
            </h2>
            {editingMovieId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded bg-error/10 px-4 py-2 text-sm font-bold text-error transition-colors hover:bg-error hover:text-white cursor-pointer"
              >
                Anuluj edycję
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-grow">
              <Input
                label="Tytuł filmu"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-48">
              <Input
                label="Czas trwania (min)"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
                min="1"
              />
            </div>
            <div className="w-full sm:w-40">
              <Button type="submit">{editingMovieId ? 'Zapisz zmiany' : 'Dodaj film'}</Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-input bg-card overflow-hidden shadow-md">
          <div className="border-b border-input bg-input/50 px-6 py-4">
            <h2 className="text-lg font-bold text-fg-default">
              Obecne filmy w bazie ({movies.length})
            </h2>
          </div>
          <ul className="divide-y divide-input">
            {movies.map((movie) => (
              <li
                key={movie.id}
                className="flex flex-col gap-4 px-6 py-4 hover:bg-input/20 sm:flex-row sm:items-center sm:justify-between transition-colors"
              >
                <div>
                  <p className="font-bold text-fg-default">{movie.title}</p>
                  <p className="text-sm text-fg-muted">
                    ID: {movie.id} | {movie.durationMinutes} min | Zaplanowane seanse:{' '}
                    {movie._count?.screenings || 0}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditClick(movie)}
                    className="rounded bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-white cursor-pointer"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(movie.id)}
                    className="rounded bg-error/10 px-4 py-2 text-sm font-bold text-error transition-colors hover:bg-error hover:text-white cursor-pointer"
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
            {movies.length === 0 && (
              <li className="px-6 py-8 text-center text-fg-muted">Brak filmów w bazie danych.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
