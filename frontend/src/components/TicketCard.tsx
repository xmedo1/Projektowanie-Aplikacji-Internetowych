import { useEffect, useState } from 'react';
import Button from './Button';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { isAxiosError } from 'axios';
import type { TicketCardProps } from '../types/';

export default function TicketCard({ reservation, onRefresh }: TicketCardProps) {
  const { showNotification } = useNotification();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const isLocked = reservation.status === 'LOCKED';
  const isBooked = reservation.status === 'BOOKED';

  const expirationTime = new Date(reservation.createdAt).getTime() + 5 * 60 * 1000;

  useEffect(() => {
    if (!isLocked) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expirationTime - now);
      setTimeLeft(remaining);

      if (remaining === 0) {
        onRefresh();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isLocked, expirationTime, onRefresh]);

  const handlePayment = async () => {
    try {
      await api.patch(`/reservations/${reservation.id}/pay`);
      showNotification('Płatność potwierdzona.');
      onRefresh();
    } catch (error) {
      if (isAxiosError(error)) {
        showNotification(error.response?.data?.error || 'Błąd płatności.', 'error');
      } else {
        showNotification('Wystąpił nieznany błąd płatności.', 'error');
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  let cardStyles = 'border-accent';
  if (isLocked) cardStyles = 'border-yellow-500';

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-xl border-l-4 bg-input p-6 shadow-md transition-all sm:flex-row ${cardStyles}`}
    >
      <div className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-page sm:block"></div>

      <div>
        <h3 className="mb-1 text-xl font-bold text-fg-default">
          {reservation.screening.movie?.title}
        </h3>
        <p className={`mb-3 font-bold ${isLocked ? 'text-yellow-500' : 'text-accent'}`}>
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
            <span className="font-medium text-fg-default">{reservation.screening.roomName}</span>
          </span>
          <span>
            Czas trwania:{' '}
            <span className="font-medium text-fg-default">
              {reservation.screening.movie?.durationMinutes} min
            </span>
          </span>
          <span>
            Rząd: <span className="font-medium text-fg-default">{reservation.seatRow}</span>
          </span>
          <span>
            Miejsce: <span className="font-medium text-fg-default">{reservation.seatNumber}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex min-w-[150px] flex-col justify-center border-t border-input pt-4 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-6 sm:text-right">
        {isBooked && (
          <>
            <div className="text-sm text-fg-muted">Twój bilet</div>
            <div className="text-xl font-black text-accent">OPŁACONY</div>
            <div className="mt-1 text-sm font-bold text-fg-muted">
              {reservation.ticketType === 'STUDENT' ? 'Ulgowy' : 'Normalny'}
            </div>
          </>
        )}

        {isLocked && (
          <div className="flex flex-col items-center sm:items-end">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-500">
              Oczekuje na płatność
            </div>
            <div className="mb-3 text-2xl font-black text-fg-default tabular-nums">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <Button onClick={handlePayment} className="py-2 text-sm w-full sm:w-auto">
              Opłać teraz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
