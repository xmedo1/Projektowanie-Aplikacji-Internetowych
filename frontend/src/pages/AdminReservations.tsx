import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import type { Reservation } from '../types';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const res = await api.get('/reservations');
        setReservations(res.data);
      } catch (err) {
        console.error('Błąd pobierania rezerwacji:', err);
        showNotification('Błąd pobierania rezerwacji', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [showNotification]);

  const handleConfirm = async (id: number) => {
    try {
      await api.put(`/reservations/${id}`, { status: 'BOOKED' });
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error('Błąd aktualizacji statusu:', err);
      showNotification('Błąd aktualizacji statusu', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno anulować tę rezerwację?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      showNotification('Rezerwacja anulowana.');
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error('Błąd podczas usuwania:', err);
      showNotification('Błąd podczas usuwania', 'error');
    }
  };

  if (loading) return <div className="p-8 text-fg-muted">Ładowanie rezerwacji...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-input pb-4">
        <h1 className="text-3xl font-black text-fg-default">
          Zarządzanie Rezerwacjami ({reservations.length})
        </h1>
        <div className="w-32">
          <Button onClick={() => navigate('/admin')}>Wróć</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-input shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-input/50">
            <tr>
              <th className="p-4 text-fg-muted text-sm">Użytkownik</th>
              <th className="p-4 text-fg-muted text-sm">Film</th>
              <th className="p-4 text-fg-muted text-sm">Miejsce</th>
              <th className="p-4 text-fg-muted text-sm">Status</th>
              <th className="p-4 text-fg-muted text-sm">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input">
            {reservations.map((r) => (
              <tr key={r.id} className="hover:bg-input/20 transition-colors">
                <td className="p-4 text-fg-default">{r.user?.email || 'Brak danych'}</td>
                <td className="p-4 text-fg-default">{r.screening.movie?.title}</td>
                <td className="p-4 text-fg-default">
                  Rząd {r.seatRow}, Miejsce {r.seatNumber}
                </td>
                <td className="p-4">
                  <span
                    className={`font-bold ${r.status === 'BOOKED' ? 'text-success' : 'text-accent'}`}
                  >
                    {r.status === 'BOOKED' ? 'Opłacone' : 'Rezerwacja'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {r.status === 'LOCKED' && (
                    <button
                      onClick={() => handleConfirm(r.id)}
                      className="text-accent font-bold text-sm hover:underline cursor-pointer"
                    >
                      Potwierdź
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-error font-bold text-sm hover:underline cursor-pointer"
                  >
                    Anuluj
                  </button>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-fg-muted">
                  Brak aktywnych rezerwacji.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
