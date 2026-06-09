import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from './middleware/auth.js';
import { z } from 'zod';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const registerSchema = z.object({
  email: z.email({ error: 'Invalid email format' }),

  password: z
    .string({ error: 'Password is required' })
    .min(8, { error: 'Password must be at least 8 characters long' }),

  firstName: z
    .string({ error: 'First name is required' })
    .min(2, { error: 'First name must be at least 2 characters long' }),
});

const loginSchema = z.object({
  email: z.email({ error: 'Invalid email format' }),

  password: z.string({ error: 'Password is required' }).min(1, { error: 'Password is required' }),
});

const reservationSchema = z.object({
  screeningId: z
    .number({ error: 'Screening ID must be a number' })
    .int({ error: 'Screening ID must be an integer' })
    .positive({ error: 'Screening ID must be positive' }),

  seatRow: z
    .string({ error: 'Seat row is required' })
    .min(1, { error: 'Seat row cannot be empty' }),

  seatNumber: z
    .number({ error: 'Seat number must be a number' })
    .int({ error: 'Seat number must be an integer' })
    .positive({ error: 'Seat number must be positive' }),

  ticketType: z.enum(['REGULAR', 'STUDENT'], {
    error: 'Invalid ticket type. Allowed: REGULAR, STUDENT',
  }),
});

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

app.post('/api/reservations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validation = reservationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues.map((issue) => issue.message),
      });
    }

    const { screeningId, seatRow, seatNumber, ticketType } = validation.data;
    const currentUserId = req.userId;

    const reservation = await prisma.seatReservation.create({
      data: {
        screeningId,
        seatRow,
        seatNumber,
        ticketType,
        userId: currentUserId as number,
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
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues.map((issue) => issue.message),
      });
    }

    const { email, password, firstName } = validation.data;

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
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues.map((issue) => issue.message),
      });
    }

    const { email, password } = validation.data;

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
