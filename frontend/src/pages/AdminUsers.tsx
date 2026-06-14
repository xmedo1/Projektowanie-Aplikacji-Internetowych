import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { isAxiosError } from 'axios';
import type { User } from '../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Błąd pobierania użytkowników:', err);
        showNotification('Nie udało się pobrać listy użytkowników.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [refreshKey, showNotification]);

  const handleToggleRole = async (targetUser: User) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const actionText =
      newRole === 'ADMIN'
        ? 'nadać uprawnienia administratora'
        : 'odebrać uprawnienia administratora';

    if (!window.confirm(`Czy na pewno chcesz ${actionText} dla ${targetUser.firstName}?`)) return;

    try {
      await api.put(`/users/${targetUser.id}/role`, { role: newRole });
      showNotification('Pomyślnie zaktualizowano uprawnienia.');
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      if (isAxiosError(error)) {
        showNotification(error.response?.data?.error || 'Błąd zmiany uprawnień', 'error');
      }
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (
      !window.confirm(`Czy na pewno chcesz na zawsze usunąć konto użytkownika ${targetUser.email}?`)
    )
      return;

    try {
      await api.delete(`/users/${targetUser.id}`);
      showNotification('Konto użytkownika zostało usunięte.');
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      if (isAxiosError(error)) {
        showNotification(error.response?.data?.error || 'Błąd usuwania konta', 'error');
      }
    }
  };

  const toggleHistory = (userId: number) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  if (loading) return <div className="p-8 text-fg-muted">Ładowanie bazy klientów...</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between border-b border-input pb-4">
          <div>
            <h1 className="text-3xl font-black text-fg-default">Zarządzanie Użytkownikami</h1>
            <p className="mt-2 text-fg-muted">
              Przeglądaj bazę zarejestrowanych klientów, sprawdzaj ich historię zakupów i
              uprawnienia.
            </p>
          </div>
          <div className="w-32">
            <Button onClick={() => navigate('/admin')}>Wróć</Button>
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card overflow-hidden shadow-md">
          <div className="border-b border-input bg-input/50 px-6 py-4">
            <h2 className="text-lg font-bold text-fg-default">
              Zarejestrowani użytkownicy ({users.length})
            </h2>
          </div>
          <ul className="divide-y divide-input">
            {users.map((u) => {
              const isMe = u.id === currentUser?.id;
              const isExpanded = expandedUserId === u.id;

              return (
                <li key={u.id} className="flex flex-col transition-colors">
                  {/* GŁÓWNY WIERZ UŻYTKOWNIKA */}
                  <div
                    className={`flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${isMe ? 'bg-accent/5' : 'hover:bg-input/20'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-fg-default">{u.firstName}</p>
                        {u.role === 'ADMIN' && (
                          <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold text-white">
                            ADMIN
                          </span>
                        )}
                        {isMe && (
                          <span className="rounded bg-fg-muted px-2 py-0.5 text-xs font-bold text-white">
                            TY
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-fg-muted">
                        ID: {u.id} | Email: {u.email}
                      </p>
                      <p className="text-xs text-fg-muted mt-1">
                        Konto utworzone:{' '}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('pl-PL')
                          : 'Brak danych'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => toggleHistory(u.id)}
                        className={`cursor-pointer rounded border border-input px-4 py-2 text-sm font-bold transition-colors ${isExpanded ? 'bg-input text-fg-default' : 'bg-transparent text-fg-muted hover:border-accent hover:text-accent'}`}
                      >
                        {isExpanded ? 'Zwiń historię' : `Historia (${u._count?.reservations || 0})`}
                      </button>

                      {!isMe && (
                        <>
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="cursor-pointer rounded bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-white"
                          >
                            {u.role === 'ADMIN' ? 'Odbierz Admina' : 'Nadaj Admina'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="cursor-pointer rounded bg-error/10 px-4 py-2 text-sm font-bold text-error transition-colors hover:bg-error hover:text-white"
                          >
                            Usuń
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-input bg-input/10 px-6 py-4 shadow-inner">
                      <h3 className="mb-3 text-sm font-bold text-fg-default">
                        Ostatnie rezerwacje:
                      </h3>
                      {u.reservations && u.reservations.length > 0 ? (
                        <ul className="space-y-2">
                          {u.reservations.map((res) => (
                            <li
                              key={res.id}
                              className="flex items-center justify-between rounded bg-card px-4 py-2 text-sm shadow-sm border border-input"
                            >
                              <div>
                                <p className="font-bold text-accent">{res.screening.movie.title}</p>
                                <p className="text-xs text-fg-muted">
                                  {new Date(res.screening.startTime).toLocaleString('pl-PL', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-bold ${res.status === 'BOOKED' ? 'text-success' : 'text-fg-muted'}`}
                                >
                                  {res.status === 'BOOKED' ? 'OPŁACONE' : 'W TRAKCIE'}
                                </p>
                                <p className="text-xs text-fg-muted">
                                  Bilet {res.ticketType === 'REGULAR' ? 'Normalny' : 'Ulgowy'}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm italic text-fg-muted">
                          Ten użytkownik nie dokonał jeszcze żadnych rezerwacji.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
            {users.length === 0 && (
              <li className="px-6 py-8 text-center text-fg-muted">Brak użytkowników w bazie.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
