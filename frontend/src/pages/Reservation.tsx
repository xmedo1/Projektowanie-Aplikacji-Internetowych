import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useNotification } from '../context/NotificationContext';
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
const SEATS_PER_ROW = 20;

export default function Reservation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSeats, setSelectedSeats] = useState<{ row: string; number: number }[]>([]);
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

  const toggleSeat = (row: string, number: number) => {
    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some((seat) => seat.row === row && seat.number === number);
      if (isAlreadySelected) {
        return prev.filter((seat) => !(seat.row === row && seat.number === number));
      } else {
        return [...prev, { row, number }];
      }
    });
  };

  const handleReservation = async () => {
    if (selectedSeats.length === 0) {
      alert('Wybierz przynajmniej jedno miejsce');
      return;
    }

    try {
      await Promise.all(
        selectedSeats.map((seat) =>
          api.post('/reservations', {
            screeningId: screening?.id,
            seatRow: seat.row,
            seatNumber: seat.number,
            ticketType,
          }),
        ),
      );

      showNotification(`Liczba zarezerwowanych biletów: ${selectedSeats.length}`);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        showNotification(
          'Jedno lub więcej z wybranych miejsc zostało w międzyczasie zajęte.',
          'error',
        );
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showNotification('Wystąpił błąd podczas rezerwacji.', 'error');
      }
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-fg-muted">
        Ładowanie sali kinowej...
      </div>
    );
  if (error || !screening)
    return <div className="mt-20 text-center text-error">{error || 'Nie znaleziono seansu'}</div>;

  const singleTicketPrice =
    ticketType === 'REGULAR' ? screening.ticketPrice : screening.ticketPrice - 500;
  const totalPrice = singleTicketPrice * selectedSeats.length;

  return (
    <div className="p-4 sm:p-8 overflow-x-auto">
      <div className="mx-auto w-fit min-w-full max-w-none">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-accent hover:underline cursor-pointer"
        >
          Wróć do opisu filmu
        </button>

        <div className="mx-auto max-w-5xl mb-8 rounded-xl border border-input bg-card p-6 shadow-xl">
          <h1 className="mb-2 text-3xl font-bold text-fg-default">{screening.movie.title}</h1>
          <p className="text-lg font-medium text-accent">
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
          <p className="mt-1 text-fg-muted">Sala: {screening.roomName}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-12 xl:flex-row xl:items-start">
          <div className="flex w-fit flex-col items-center rounded-xl bg-card p-8 shadow-xl">
            <div className="mb-12 flex h-8 w-3/4 items-center justify-center rounded-t-3xl bg-fg-muted/20 text-sm font-bold text-fg-muted shadow-[0_20px_20px_rgba(0,0,0,0.05)]">
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
                      const selected = selectedSeats.some(
                        (s) => s.row === row && s.number === number,
                      );

                      return (
                        <button
                          key={`${row}-${number}`}
                          disabled={taken}
                          onClick={() => toggleSeat(row, number)}
                          className={`
                            flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-b-sm rounded-t-lg border text-sm font-bold transition-all
                            ${taken ? 'line-through cursor-not-allowed border-transparent bg-fg-muted/20 text-fg-muted' : ''}
                            ${selected ? 'scale-110 border-accent bg-accent shadow-[0_0_10px_var(--color-accent)] text-fg-on-accent' : ''}
                            ${!taken && !selected ? 'border-transparent bg-input text-fg-default hover:border-accent hover:text-accent' : ''}
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

            <div className="mt-12 flex justify-center gap-8 text-sm text-fg-muted">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm border border-transparent bg-input"></div>
                Wolne
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm border border-accent bg-accent"></div>
                Wybrane
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-transparent bg-fg-muted/20">
                  <div className="h-[2px] w-full bg-fg-muted opacity-50"></div>
                </div>
                Zajęte
              </div>
            </div>
          </div>

          <div className="h-fit w-full flex-shrink-0 rounded-xl border border-input bg-card p-6 shadow-xl xl:w-80">
            <h2 className="mb-6 border-b border-input pb-4 text-xl font-bold">Podsumowanie</h2>

            <div className="mb-6">
              <div className="mb-2 text-sm text-fg-muted">
                Wybrane miejsca ({selectedSeats.length}):
              </div>
              {selectedSeats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <div
                      key={`${seat.row}-${seat.number}`}
                      className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-sm font-bold text-accent"
                    >
                      {seat.row}
                      {seat.number}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-lg italic text-fg-muted">Nie wybrano miejsc</div>
              )}
            </div>

            <div className="mb-8">
              <div className="mb-2 text-sm text-fg-muted">Typ biletów:</div>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as 'REGULAR' | 'STUDENT')}
                className="w-full rounded-lg border border-input bg-input px-4 py-2 text-fg-default focus:border-accent focus:outline-none"
              >
                <option value="REGULAR">
                  Normalny ({(screening.ticketPrice / 100).toFixed(2)} zł/szt.)
                </option>
                <option value="STUDENT">
                  Ulgowy ({((screening.ticketPrice - 500) / 100).toFixed(2)} zł/szt.)
                </option>
              </select>
            </div>

            {selectedSeats.length > 0 && (
              <div className="mb-6 flex items-center justify-between border-t border-input pt-4">
                <span className="text-fg-muted">Łącznie do zapłaty:</span>
                <span className="text-2xl font-black text-fg-default">
                  {(totalPrice / 100).toFixed(2)} zł
                </span>
              </div>
            )}

            <Button onClick={handleReservation}>Kup bilet</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
