import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import type { DashboardStats, ActionCardProps } from '../types/index.ts';

function StatCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-input bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent">
      <p className="text-sm font-bold text-fg-muted">{title}</p>
      {children}
    </div>
  );
}

function ActionCard({
  title,
  description,
  buttonText,
  buttonWidth = 'w-48',
  onClick,
}: ActionCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-input bg-card p-6 shadow-md transition-all hover:border-accent">
      <h2 className="mb-2 text-xl font-bold text-accent">{title}</h2>
      <p className="mb-6 flex-grow text-sm text-fg-muted">{description}</p>
      <div className={`mt-auto ${buttonWidth}`}>
        <Button onClick={onClick}>{buttonText}</Button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;

    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Błąd pobierania statystyk:', err);
        setError('Nie udało się załadować statystyk.');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  if (authLoading) return null;

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
        <p className="text-xl font-bold text-error">Brak dostępu.</p>
        <div className="w-64">
          <Button onClick={() => navigate('/')}>Wróć do strony głównej</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-input pb-4">
          <h1 className="text-3xl font-black text-fg-default">Panel Administratora</h1>
          <p className="mt-2 text-fg-muted">Zarządzaj systemem rezerwacji biletów</p>
        </div>

        {/* SEKCJA STATYSTYK */}
        {loadingStats ? (
          <div className="mb-10 text-fg-muted">Ładowanie statystyk...</div>
        ) : error ? (
          <div className="mb-10 text-error">{error}</div>
        ) : stats ? (
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            <StatCard title="Zarobki z biletów">
              <p className="mt-1 text-3xl font-black text-accent">
                {new Intl.NumberFormat('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                }).format(stats.totalRevenue / 100)}
              </p>
            </StatCard>

            <StatCard title="Kupione bilety">
              <p className="mt-1 text-3xl font-black text-fg-default">
                {stats.ticketsNormal + stats.ticketsStudent}
              </p>
              <p className="mt-1 text-xs font-medium text-fg-muted">
                Normalne: <span className="text-fg-default">{stats.ticketsNormal}</span> | Ulgowe:{' '}
                <span className="text-fg-default">{stats.ticketsStudent}</span>
              </p>
            </StatCard>

            <StatCard title="Użytkownicy">
              <p className="mt-1 text-3xl font-black text-fg-default">{stats.totalUsers}</p>
            </StatCard>

            <StatCard title="Baza / Repertuar">
              <p className="mt-1 text-3xl font-black text-fg-default">
                {stats.totalMovies}{' '}
                <span className="text-xl font-normal text-fg-muted">/ {stats.totalScreenings}</span>
              </p>
            </StatCard>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <ActionCard
            title="Baza Filmów"
            description="Dodawaj, edytuj, usuwaj filmy w bazie danych."
            buttonText="Zarządzaj filmami"
            onClick={() => navigate('/admin/movies')}
          />
          <ActionCard
            title="Repertuar Seansów"
            description="Planuj godziny pokazów, przypisuj filmy do sal kinowych i ustalaj ceny biletów na konkretne dni."
            buttonText="Zarządzaj seansami"
            onClick={() => navigate('/admin/screenings')}
          />
          <ActionCard
            title="Użytkownicy"
            description="Przeglądaj zarejestrowanych użytkowników, sprawdzaj ich role i historię zakupów w kinie."
            buttonText="Zarządzaj użytkownikami"
            buttonWidth="w-56"
            onClick={() => navigate('/admin/users')}
          />
          <ActionCard
            title="Bilety i Rezerwacje"
            description="Weryfikuj statusy płatności, monitoruj sprzedaż na bieżąco i ręcznie anuluj wybrane rezerwacje."
            buttonText="Zarządzaj rezerwacjami"
            buttonWidth="w-56"
            onClick={() => navigate('/admin/reservations')}
          />
        </div>
      </div>
    </div>
  );
}
