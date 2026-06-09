import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined.');
  process.exit(1);
}

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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        passwordHash: hashedPassword,
      },
    });

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`API URL: http://localhost:${PORT}`);
});
