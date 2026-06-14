import type { Reservation } from '../types';

interface TicketCardProps {
  reservation: Reservation;
}

export default function TicketCard({ reservation }: TicketCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border-l-4 border-accent bg-input p-6 shadow-md sm:flex-row">
      <div className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-page sm:block"></div>

      <div>
        <h3 className="mb-1 text-xl font-bold text-fg-default">
          {reservation.screening.movie?.title}
        </h3>
        <p className="mb-3 font-bold text-accent">
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
        </div>
      </div>

      <div className="mt-4 flex flex-col justify-center border-t border-input pt-4 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-6 sm:text-right">
        <div className="text-sm text-fg-muted">Twój bilet</div>
        <div className="text-2xl font-black text-fg-default">
          Rząd {reservation.seatRow}, Miejsce {reservation.seatNumber}
        </div>
        <div className="mt-1 text-sm font-bold text-fg-muted">
          {reservation.ticketType === 'STUDENT' ? 'Ulgowy' : 'Normalny'}
        </div>
      </div>
    </div>
  );
}
