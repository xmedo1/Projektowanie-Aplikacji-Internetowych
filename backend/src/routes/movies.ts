import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// C
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, durationMinutes } = req.body;
    if (!title || !durationMinutes) {
      return res.status(400).json({ error: 'Podaj tytuł i czas trwania filmu.' });
    }
    const newMovie = await prisma.movie.create({
      data: { title, durationMinutes: Number(durationMinutes) },
    });
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Nie udało się dodać filmu.' });
  }
});

// R
router.get('/', async (_req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      include: { _count: { select: { screenings: true } } },
    });
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) return res.status(400).json({ error: 'Wrong movie ID' });

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: { screenings: true },
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// U
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movieId = parseInt(req.params.id as string);
    const { title, durationMinutes } = req.body;
    if (!title || !durationMinutes) {
      return res.status(400).json({ error: 'Podaj tytuł i czas trwania filmu.' });
    }
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: { title, durationMinutes: Number(durationMinutes) },
    });
    res.json(updatedMovie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Nie udało się zaktualizować filmu.' });
  }
});

// D
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movieId = parseInt(req.params.id as string);
    await prisma.movie.delete({ where: { id: movieId } });
    res.json({ message: 'Film został usunięty.' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res
      .status(400)
      .json({ error: 'Nie można usunąć filmu. Prawdopodobnie są do niego przypisane seanse.' });
  }
});

export default router;
