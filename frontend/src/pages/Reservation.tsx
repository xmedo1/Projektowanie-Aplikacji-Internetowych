import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { isAxiosError } from 'axios';

interface Screening {
  id: number;
  startTime: string;
  roomName: string;
  ticketPrice: number;
  movie: { title: string; durationMinutes: number };
  reservations: { seatRow: string; seatNumber: number; status: string }[];
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SEATS_PER_ROW = 10; // todo: powiększenie okna

export default function Reservation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useAuth();

  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSeat, setSelectedSeat] = useState<{ row: string; number: number } | null>(null);
  const [ticketType, setTicketType] = useState<'REGULAR' | 'STUDENT'>('REGULAR');

  useEffect(() => {
    const fetchScreening = async () => {
      try {
        const response = await api.get(`/screenings/${id}`);
        setScreening(response.data);
      } catch (err) {
        console.error(err);
        setError('Nie udało się pobrać danych seansu.');
      } finally {
        setLoading(false);
      }
    };
    fetchScreening();
  }, [id]);

  const isSeatTaken = (row: string, number: number) => {
    if (!screening) return false;
    return screening.reservations.some((res) => res.seatRow === row && res.seatNumber === number);
  };

  const handleReservation = async () => {
    if (!selectedSeat) {
      alert('Wybierz miejsce!');
      return;
    }

    try {
      await api.post('/reservations', {
        screeningId: screening?.id,
        seatRow: selectedSeat.row,
        seatNumber: selectedSeat.number,
        ticketType,
      });

      showNotification('Bilet został zarezerwowany');
      navigate('/profile');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        alert('Miejsce zajęte');
        window.location.reload();
      } else {
        alert('Błąd podczas rezerwacji.');
      }
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-fg-muted">
        Ładowanie sali kinowej...
      </div>
    );
  if (error || !screening)
    return <div className="text-center text-error mt-20">{error || 'Nie znaleziono seansu'}</div>;

  return (
    <div className="min-h-screen bg-page text-fg-default p-8">
      <div className="container mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-accent hover:underline flex items-center gap-2"
        >
          ← Wróć do opisu filmu
        </button>

        <div className="mb-8 rounded-xl bg-card p-6 shadow-xl border border-input">
          <h1 className="text-3xl font-bold text-white mb-2">{screening.movie.title}</h1>
          <p className="text-accent font-medium text-lg">
            {new Date(screening.startTime).toLocaleDateString('pl-PL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            o{' '}
            {new Date(screening.startTime).toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-fg-muted mt-1">Sala: {screening.roomName}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 rounded-xl bg-card p-8 shadow-xl flex flex-col items-center overflow-x-auto">
            <div className="w-3/4 h-8 bg-gray-600 rounded-t-3xl mb-12 flex items-center justify-center text-sm font-bold text-gray-300 shadow-[0_20px_20px_rgba(255,255,255,0.05)]">
              EKRAN
            </div>

            <div className="flex flex-col gap-4">
              {ROWS.map((row) => (
                <div key={row} className="flex items-center gap-4">
                  <div className="w-6 text-center font-bold text-fg-muted">{row}</div>
                  <div className="flex gap-2">
                    {Array.from({ length: SEATS_PER_ROW }).map((_, idx) => {
                      const number = idx + 1;
                      const taken = isSeatTaken(row, number);
                      const selected = selectedSeat?.row === row && selectedSeat?.number === number;

                      return (
                        <button
                          key={`${row}-${number}`}
                          disabled={taken}
                          onClick={() => setSelectedSeat({ row, number })}
                          className={`
                            h-10 w-10 rounded-t-lg rounded-b-sm font-bold text-sm transition-all
                            ${taken ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : ''}
                            ${selected ? 'bg-accent text-white scale-110 shadow-[0_0_10px_#10b981]' : ''}
                            ${!taken && !selected ? 'bg-input text-gray-300 hover:border hover:border-accent hover:text-white' : ''}
                          `}
                        >
                          {number}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-6 text-center font-bold text-fg-muted">{row}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex gap-6 text-sm text-fg-muted">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-input"></div> Wolne
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-accent"></div> Wybrane
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-gray-700"></div> Zajęte
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 h-fit rounded-xl bg-card p-6 shadow-xl border border-input">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">Podsumowanie</h2>

            <div className="mb-6">
              <div className="text-sm text-fg-muted mb-1">Wybrane miejsce:</div>
              {selectedSeat ? (
                <div className="text-2xl font-bold text-white">
                  Rząd {selectedSeat.row}, Miejsce {selectedSeat.number}
                </div>
              ) : (
                <div className="text-lg text-gray-500 italic">Nie wybrano miejsca</div>
              )}
            </div>

            <div className="mb-8">
              <div className="text-sm text-fg-muted mb-2">Typ biletu:</div>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as 'REGULAR' | 'STUDENT')}
                className="w-full bg-input border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-accent focus:outline-none"
              >
                <option value="REGULAR">
                  Normalny ({(screening.ticketPrice / 100).toFixed(2)} zł)
                </option>
                <option value="STUDENT">
                  Ulgowy ({((screening.ticketPrice - 500) / 100).toFixed(2)} zł)
                </option>
              </select>
            </div>

            <Button onClick={handleReservation}>Kup bilet</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
