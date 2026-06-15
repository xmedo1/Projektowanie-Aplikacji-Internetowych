import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
        createdAt: true,
        _count: { select: { reservations: true } },
        reservations: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            ticketType: true,
            createdAt: true,
            screening: {
              select: {
                startTime: true,
                ticketPrice: true,
                movie: { select: { title: true } },
              },
            },
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Błąd pobierania użytkowników:', error);
    res.status(500).json({ error: 'Nie udało się pobrać listy użytkowników.' });
  }
});

router.put('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const { role } = req.body;

    if (role !== 'USER' && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Nieprawidłowa rola.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, email: true, firstName: true, role: true },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Błąd zmiany roli:', error);
    res.status(500).json({ error: 'Nie udało się zmienić uprawnień.' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);

    await prisma.user.delete({ where: { id: targetUserId } });
    res.json({ message: 'Użytkownik został usunięty.' });
  } catch (error) {
    console.error('Błąd usuwania użytkownika:', error);
    res.status(400).json({
      error: 'Nie można usunąć użytkownika. Prawdopodobnie posiada rezerwacje w systemie.',
    });
  }
});

export default router;
