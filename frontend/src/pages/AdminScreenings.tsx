import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { useNotification } from '../context/NotificationContext';
import { isAxiosError } from 'axios';
import type { Screening, Movie } from '../types';

export default function AdminScreenings() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);

  const [movieId, setMovieId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [roomName, setRoomName] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingScreeningId, setEditingScreeningId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [screeningsRes, moviesRes] = await Promise.all([
          api.get('/screenings'),
          api.get('/movies'),
        ]);
        setScreenings(screeningsRes.data);
        setMovies(moviesRes.data);
      } catch (err) {
        console.error('Błąd pobierania danych:', err);
        showNotification('Nie udało się pobrać danych z serwera.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshKey, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceInCents = Math.round(parseFloat(ticketPrice) * 100);

    const payload = {
      movieId: parseInt(movieId),
      startTime,
      ticketPrice: priceInCents,
      roomName,
    };

    if (editingScreeningId) {
      try {
        await api.put(`/screenings/${editingScreeningId}`, payload);
        showNotification('Pomyślnie zaktualizowano seans.');
        handleCancelEdit();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        if (isAxiosError(error)) {
          showNotification(error.response?.data?.error || 'Błąd aktualizacji seansu', 'error');
        }
      }
    } else {
      try {
        await api.post('/screenings', payload);
        showNotification('Pomyślnie dodano seans do repertuaru.');
        setMovieId('');
        setStartTime('');
        setTicketPrice('');
        setRoomName('');
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        if (isAxiosError(error)) {
          showNotification(error.response?.data?.error || 'Błąd dodawania seansu', 'error');
        }
      }
    }
  };

  const handleEditClick = (screening: Screening) => {
    setEditingScreeningId(screening.id);
    setMovieId(screening.movieId.toString());
    setRoomName(screening.roomName);

    const formattedDate = new Date(screening.startTime).toISOString().slice(0, 16);
    setStartTime(formattedDate);
    setTicketPrice((screening.ticketPrice / 100).toFixed(2));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingScreeningId(null);
    setMovieId('');
    setStartTime('');
    setTicketPrice('');
    setRoomName('');
  };

  const handleDeleteScreening = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten seans?')) return;

    try {
      await api.delete(`/screenings/${id}`);
      showNotification('Seans został usunięty.');

      if (editingScreeningId === id) handleCancelEdit();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      if (isAxiosError(error)) {
        showNotification(error.response?.data?.error || 'Błąd usuwania seansu', 'error');
      }
    }
  };

  if (loading) return <div className="p-8 text-fg-muted">Ładowanie repertuaru...</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between border-b border-input pb-4">
          <div>
            <h1 className="text-3xl font-black text-fg-default">Zarządzanie Seansami</h1>
            <p className="mt-2 text-fg-muted">
              Planuj godziny pokazów, przypisuj filmy do sal kinowych i ustalaj ceny biletów na
              konkretne dni.
            </p>
          </div>
          <div className="w-32">
            <Button onClick={() => navigate('/admin')}>Wróć</Button>
          </div>
        </div>

        <div className="mb-10 rounded-xl border border-input bg-card p-6 shadow-md transition-colors">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-accent">
              {editingScreeningId ? 'Edytujesz seans' : 'Zaplanuj nowy seans'}
            </h2>
            {editingScreeningId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="cursor-pointer rounded bg-error/10 px-4 py-2 text-sm font-bold text-error transition-colors hover:bg-error hover:text-white"
              >
                Anuluj edycję
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-grow">
              <label className="mb-1 block text-sm font-bold text-fg-muted">Wybierz film</label>
              <select
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-card px-4 py-3 text-fg-default outline-none transition-colors focus:border-accent"
              >
                <option value="" disabled>
                  Wybierz z listy...
                </option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-32">
              <Input
                label="Sala"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="np. Sala 1"
                required
              />
            </div>

            <div className="w-full sm:w-56">
              <Input
                label="Data i godzina"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="w-full sm:w-32">
              <Input
                label="Cena (PLN)"
                type="number"
                step="0.01"
                min="0.01"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                placeholder="25.50"
                required
              />
            </div>

            <div className="w-full sm:w-40">
              <Button type="submit">{editingScreeningId ? 'Zapisz' : 'Dodaj seans'}</Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-input bg-card overflow-hidden shadow-md">
          <div className="border-b border-input bg-input/50 px-6 py-4">
            <h2 className="text-lg font-bold text-fg-default">
              Zaplanowane seanse w bazie ({screenings.length})
            </h2>
          </div>
          <ul className="divide-y divide-input">
            {screenings.map((screening) => (
              <li
                key={screening.id}
                className="flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-input/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-fg-default">
                    {screening.movie?.title || 'Nieznany film'}
                  </p>
                  <p className="text-sm text-fg-muted">
                    ID: {screening.id} | {screening.roomName} | Data:{' '}
                    {new Date(screening.startTime).toLocaleString('pl-PL')} | Cena:{' '}
                    {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(
                      screening.ticketPrice / 100,
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditClick(screening)}
                    className="cursor-pointer rounded bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-white"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDeleteScreening(screening.id)}
                    className="cursor-pointer rounded bg-error/10 px-4 py-2 text-sm font-bold text-error transition-colors hover:bg-error hover:text-white"
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
            {screenings.length === 0 && (
              <li className="px-6 py-8 text-center text-fg-muted">Brak zaplanowanych seansów.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
