export interface Movie {
  id: number;
  title: string;
  durationMinutes: number;
  screenings?: Screening[];
}

export interface Screening {
  id: number;
  startTime: string;
  roomName: string;
  ticketPrice: number;
  movie?: Movie;
  reservations?: { seatRow: string; seatNumber: number; status: string }[];
}

export interface Reservation {
  id: number;
  seatRow: string;
  seatNumber: number;
  ticketType: string;
  status: string;
  screening: Screening;
}
