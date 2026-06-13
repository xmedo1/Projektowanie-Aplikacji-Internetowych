import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { isAxiosError } from 'axios';

interface Movie {
  title: string;
  durationMinutes: number;
}

interface Screening {
  startTime: string;
  roomName: string;
  movie: Movie;
}

interface Reservation {
  id: number;
  seatRow: string;
  seatNumber: number;
  ticketType: string;
  status: string;
  screening: Screening;
}

export default function Profile() {
  const { user, refreshUser, showNotification } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get('/auth/my-reservations');
        setReservations(response.data);
      } catch (error) {
        console.error('Błąd pobierania biletów:', error);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchReservations();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: { firstName: string; email: string; password?: string } = {
        firstName,
        email,
      };

      if (password) {
        payload.password = password;
      }

      await api.put('/auth/update-profile', payload);

      await refreshUser();

      setPassword('');
      showNotification('Dane profilu zostały zaktualizowane!');
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.error || 'Błąd aktualizacji danych.');
      } else {
        alert('Wystąpił nieznany błąd.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-page text-fg-default p-8">
      <div className="container mx-auto max-w-5xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-accent hover:underline flex items-center gap-2"
        >
          Wróć do repertuaru
        </button>

        <h1 className="text-3xl font-bold text-accent mb-8 border-b border-input pb-4">
          Mój Profil
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-xl shadow-xl">
              <h2 className="text-xl font-bold mb-6">Ustawienia konta</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-fg-muted mb-1">Imię</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-md border border-input bg-page px-4 py-2 focus:border-accent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fg-muted mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-input bg-page px-4 py-2 focus:border-accent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fg-muted mb-1">
                    Nowe hasło (opcjonalne)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-input bg-page px-4 py-2 focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="pt-4">
                  <Button type="submit">Zapisz zmiany</Button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Moje Bilety</h2>

            {loadingTickets ? (
              <p className="text-fg-muted">Ładowanie biletów...</p>
            ) : reservations.length === 0 ? (
              <div className="bg-input p-8 rounded-xl text-center border border-dashed border-gray-600">
                <p className="text-fg-muted text-lg">Nie masz jeszcze żadnych rezerwacji.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-accent hover:underline">
                  Przejdź do repertuaru i zarezerwuj swój pierwszy seans.
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex flex-col sm:flex-row justify-between bg-input p-6 rounded-xl shadow-md border-l-4 border-accent relative overflow-hidden"
                  >
                    <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-page sm:block hidden"></div>

                    <div>
                      <h3 className="text-xl font-bold text-fg-default mb-1">
                        {reservation.screening.movie.title}
                      </h3>
                      <p className="text-accent font-bold mb-3">
                        {new Date(reservation.screening.startTime).toLocaleDateString('pl-PL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}{' '}
                        •{' '}
                        {new Date(reservation.screening.startTime).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <div className="flex gap-4 text-sm text-fg-muted">
                        <span>
                          Sala:{' '}
                          <span className="text-fg-default font-medium">
                            {reservation.screening.roomName}
                          </span>
                        </span>
                        <span>
                          Czas trwania:{' '}
                          <span className="text-fg-default font-medium">
                            {reservation.screening.movie.durationMinutes} min
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:text-right border-t sm:border-t-0 sm:border-l border-gray-600 pt-4 sm:pt-0 sm:pl-6 flex flex-col justify-center">
                      <div className="text-sm text-fg-muted">Twój bilet</div>
                      <div className="text-2xl font-black text-fg-default">
                        Rząd {reservation.seatRow}, Miejsce {reservation.seatNumber}
                      </div>
                      <div className="text-sm font-bold mt-1 text-fg-muted">
                        {reservation.ticketType === 'STUDENT' ? 'Ulgowy' : 'Normalny'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
