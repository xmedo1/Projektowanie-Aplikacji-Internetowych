import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const totalMovies = await prisma.movie.count();
    const totalScreenings = await prisma.screening.count();
    const totalUsers = await prisma.user.count();

    const bookedReservations = await prisma.seatReservation.findMany({
      where: { status: 'BOOKED' },
      include: { screening: true },
    });

    let ticketsNormal = 0;
    let ticketsStudent = 0;
    let totalRevenue = 0;

    bookedReservations.forEach((reservation) => {
      const basePrice = reservation.screening.ticketPrice;
      if (reservation.ticketType === 'STUDENT') {
        ticketsStudent++;
        totalRevenue += basePrice - 500;
      } else {
        ticketsNormal++;
        totalRevenue += basePrice;
      }
    });

    res.json({
      totalMovies,
      totalScreenings,
      totalUsers,
      totalRevenue,
      ticketsNormal,
      ticketsStudent,
    });
  } catch (error) {
    console.error('Błąd pobierania statystyk:', error);
    res.status(500).json({ error: 'Nie udało się pobrać statystyk bazy danych.' });
  }
});

export default router;
