import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import moviesRouter from './routes/movies.js';
import screeningsRouter from './routes/screenings.js';
import reservationsRouter from './routes/reservations.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = 3000;

if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined.');
  process.exit(1);
}

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/movies', moviesRouter);
app.use('/api/screenings', screeningsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', statsRouter);
app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`API URL: http://localhost:${PORT}`);
});
