import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/Button';
import Input from '../components/Input';
import TicketCard from '../components/TicketCard';
import { isAxiosError } from 'axios';
import type { Reservation } from '../types';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

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
        showNotification(error.response?.data?.error || 'Błąd aktualizacji danych.', 'error');
      } else {
        showNotification('Wystąpił nieznany błąd.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-page text-fg-default p-8">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8 w-56">
          <Button onClick={() => navigate('/')}>Wróć do repertuaru</Button>
        </div>

        <h1 className="text-3xl font-bold text-accent mb-8 border-b border-input pb-4">
          Mój Profil
        </h1>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-card p-6 shadow-xl">
              <h2 className="mb-6 text-xl font-bold">Ustawienia konta</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="Imię"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Nowe hasło (opcjonalne)"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="pt-4">
                  <Button type="submit">Zapisz zmiany</Button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-6 text-xl font-bold">Moje Bilety</h2>

            {loadingTickets ? (
              <p className="text-fg-muted">Ładowanie biletów...</p>
            ) : reservations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-fg-muted bg-input p-8 text-center">
                <p className="text-lg text-fg-muted">Nie masz jeszcze żadnych rezerwacji.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 cursor-pointer text-accent transition hover:underline"
                >
                  Przejdź do repertuaru i zarezerwuj swój pierwszy seans.
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <TicketCard
                    key={reservation.id}
                    reservation={reservation}
                    onRefresh={fetchReservations}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
