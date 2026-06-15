import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// C
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { movieId, startTime, ticketPrice, roomName } = req.body;
    if (!movieId || !startTime || !ticketPrice || !roomName) {
      return res.status(400).json({ error: 'Podaj film, datę, cenę biletu i salę kinową.' });
    }
    const newScreening = await prisma.screening.create({
      data: {
        movieId: Number(movieId),
        startTime: new Date(startTime),
        ticketPrice: Number(ticketPrice),
        roomName: String(roomName),
      },
      include: { movie: true },
    });
    res.status(201).json(newScreening);
  } catch (error) {
    console.error('Błąd dodawania seansu:', error);
    res.status(500).json({ error: 'Nie udało się dodać seansu.' });
  }
});

// R
router.get('/', async (_req, res) => {
  try {
    const screenings = await prisma.screening.findMany({
      include: { movie: true },
      orderBy: { startTime: 'asc' },
    });
    res.json(screenings);
  } catch (error) {
    console.error('Error fetching screenings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const screeningId = parseInt(req.params.id);
    if (isNaN(screeningId)) return res.status(400).json({ error: 'Wrong screening ID' });

    const expirationTime = new Date(Date.now() - 5 * 60 * 1000); // teraz - 5 minut

    // usuwanie nieopłaconych rezerwacji
    await prisma.seatReservation.deleteMany({
      where: {
        screeningId,
        status: 'LOCKED',
        createdAt: {
          lt: expirationTime,
        },
      },
    });

    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
      include: {
        movie: true,
        reservations: {
          select: { seatRow: true, seatNumber: true, status: true },
        },
      },
    });
    if (!screening) return res.status(404).json({ error: 'Screening not found' });

    res.json(screening);
  } catch (error) {
    console.error('Error fetching screening:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// U
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const screeningId = parseInt(req.params.id as string);
    const { movieId, startTime, ticketPrice, roomName } = req.body;
    if (!movieId || !startTime || !ticketPrice || !roomName) {
      return res.status(400).json({ error: 'Podaj film, datę, cenę biletu i salę kinową.' });
    }
    const updatedScreening = await prisma.screening.update({
      where: { id: screeningId },
      data: {
        movieId: Number(movieId),
        startTime: new Date(startTime),
        ticketPrice: Number(ticketPrice),
        roomName: String(roomName),
      },
      include: { movie: true },
    });
    res.json(updatedScreening);
  } catch (error) {
    console.error('Błąd aktualizacji seansu:', error);
    res.status(500).json({ error: 'Nie udało się zaktualizować seansu.' });
  }
});

// D
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const screeningId = parseInt(req.params.id as string);
    await prisma.screening.delete({ where: { id: screeningId } });
    res.json({ message: 'Seans usunięty.' });
  } catch (error) {
    console.error('Błąd usuwania seansu:', error);
    res.status(400).json({ error: 'Nie można usunąć seansu.' });
  }
});

export default router;
