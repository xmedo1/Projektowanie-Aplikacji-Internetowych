export interface Movie {
  id: number;
  title: string;
  durationMinutes: number;
  screenings?: Screening[];
  _count?: {
    screenings: number;
  };
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
  createdAt: string;
}

export interface TicketCardProps {
  reservation: Reservation;
  onRefresh: () => void;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  role: 'USER' | 'ADMIN';
}

export interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonWidth?: string;
  onClick: () => void;
}

export interface DashboardStats {
  totalMovies: number;
  totalScreenings: number;
  totalUsers: number;
  totalRevenue: number;
  ticketsNormal: number;
  ticketsStudent: number;
}
