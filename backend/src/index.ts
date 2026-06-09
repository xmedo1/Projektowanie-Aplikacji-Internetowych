import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/movies', async (_req, res) => {
  try {
    const movies = await prisma.movie.findMany();
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ error: 'Wrong movie ID' });
    }
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: { screenings: true },
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/screenings/:id', async (req, res) => {
  try {
    const screeningId = parseInt(req.params.id);
    if (isNaN(screeningId)) {
      return res.status(400).json({ error: 'Wrong screening ID' });
    }
    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
      include: {
        movie: true,
        reservations: {
          select: { seatRow: true, seatNumber: true, status: true },
        },
      },
    });

    if (!screening) {
      return res.status(404).json({ error: 'Screening not found' });
    }
    res.json(screening);
  } catch (error) {
    console.error('Error fetching screening:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { screeningId, seatRow, seatNumber, ticketType, userId } = req.body;

    if (!screeningId || !seatRow || !seatNumber || !ticketType || !userId) {
      return res.status(400).json({ error: 'Missing reservation data' });
    }

    const reservation = await prisma.seatReservation.create({
      data: {
        screeningId: parseInt(screeningId),
        seatRow,
        seatNumber: parseInt(seatNumber),
        ticketType,
        userId: parseInt(userId),
        status: 'LOCKED',
      },
    });

    res.status(201).json(reservation);
  } catch (error: any) {
    console.error('Error creating reservation:', error);

    // błąd unique
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'This seat is already taken' });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`API URL: http://localhost:${PORT}`);
});
