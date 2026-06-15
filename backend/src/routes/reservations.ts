import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { reservationSchema, paymentSchema } from '../schemas/index.js';

const router = Router();

// C
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validation = reservationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues.map((i) => i.message),
      });
    }
    const { screeningId, seatRow, seatNumber, ticketType } = validation.data;
    const reservation = await prisma.seatReservation.create({
      data: {
        screeningId,
        seatRow,
        seatNumber,
        ticketType,
        userId: req.userId as number,
        status: 'LOCKED',
      },
    });
    res.status(201).json(reservation);
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'This seat is already taken' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// R
router.get('/', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const reservations = await prisma.seatReservation.findMany({
      include: { user: true, screening: { include: { movie: true } } },
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// U
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id as string);
    const { status, ticketType } = req.body;
    const updatedReservation = await prisma.seatReservation.update({
      where: { id: reservationId },
      data: { status, ticketType },
    });
    res.json(updatedReservation);
  } catch (error) {
    res.status(400).json({ error: 'Nie udało się zaktualizować rezerwacji.' });
  }
});

router.patch('/:id/pay', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validation = paymentSchema.safeParse({
      reservationId: parseInt(req.params.id as string),
    });

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues.map((issue) => issue.message),
      });
    }

    const { reservationId } = validation.data;

    const reservation = await prisma.seatReservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.userId !== req.userId) {
      return res.status(403).json({ error: 'You do not own this reservation' });
    }

    if (reservation.status === 'BOOKED') {
      return res.status(400).json({ error: 'Reservation is already paid' });
    }

    const expirationTime = new Date(reservation.createdAt.getTime() + 5 * 60 * 1000);
    if (new Date() > expirationTime) {
      await prisma.seatReservation.delete({ where: { id: reservationId } });
      return res.status(410).json({ error: 'Reservation has expired' });
    }

    const updatedReservation = await prisma.seatReservation.update({
      where: { id: reservationId },
      data: { status: 'BOOKED' },
    });

    res.json({ message: 'Payment successful', reservation: updatedReservation });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// D
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.seatReservation.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: 'Rezerwacja usunięta.' });
  } catch (error) {
    res.status(400).json({ error: 'Błąd usuwania rezerwacji.' });
  }
});

export default router;
