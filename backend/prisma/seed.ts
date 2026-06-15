import { ReservationStatus, TicketType, Role } from '@prisma/client';
import { prisma } from '../src/db.js';

async function main() {
  console.log('Deleting old entries...');
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "SeatReservation", "Screening", "Movie", "User" RESTART IDENTITY CASCADE;
  `);

  console.log('Creating demo entries in database.');

  const user = await prisma.user.create({
    data: {
      email: 'jankowalski@example.com',
      passwordHash: '$2b$10$x2PyC.TpS4YNQm26OT5.x..buaSG4jprk.huasXjY4sTI4kl019LK', // hasło: "password" + salt
      firstName: 'Jan',
      role: Role.USER,
    },
  });
  console.log(`Created user: ${user.email}`);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: '$2b$10$x2PyC.TpS4YNQm26OT5.x..buaSG4jprk.huasXjY4sTI4kl019LK', // hasło: "password" + salt
      firstName: 'Admin',
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin: ${adminUser.email}`);

  const moviesData = [
    { title: 'Titanic', durationMinutes: 195 },
    { title: 'Władca Pierścieni: Powrót Króla', durationMinutes: 201 },
    { title: 'Forrest Gump', durationMinutes: 142 },
    { title: 'Fight Club', durationMinutes: 139 },
    { title: 'Matrix', durationMinutes: 136 },
    { title: 'Interstellar', durationMinutes: 169 },
    { title: 'Gwiezdne Wojny', durationMinutes: 121 },
  ];

  const movies = [];
  for (const m of moviesData) {
    const movie = await prisma.movie.create({ data: m });
    movies.push(movie);
  }
  console.log(`Created ${movies.length} movies.`);

  const screeningsData = [
    {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      roomName: 'Sala 1',
      ticketPrice: 2500,
      movieId: movies[0].id,
    },
    {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      roomName: 'Sala 2',
      ticketPrice: 2500,
      movieId: movies[0].id,
    },
    {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      roomName: 'Sala 1',
      ticketPrice: 2500,
      movieId: movies[1].id,
    },
    {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      roomName: 'Sala IMAX',
      ticketPrice: 3500,
      movieId: movies[1].id,
    },
    {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      roomName: 'Sala 3',
      ticketPrice: 2500,
      movieId: movies[2].id,
    },
    {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      roomName: 'Sala 1',
      ticketPrice: 2500,
      movieId: movies[3].id,
    },
    {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      roomName: 'Sala 1',
      ticketPrice: 2500,
      movieId: movies[4].id,
    },
    {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      roomName: 'Sala 1',
      ticketPrice: 2500,
      movieId: movies[5].id,
    },
  ];

  const screenings = [];
  for (const s of screeningsData) {
    const screening = await prisma.screening.create({ data: s });
    screenings.push(screening);
  }
  console.log(`Created ${screenings.length} screenings.`);

  const reservationsData = [
    {
      screeningId: screenings[0].id,
      userId: user.id,
      seatRow: 'A',
      seatNumber: 1,
      status: ReservationStatus.BOOKED,
      ticketType: TicketType.REGULAR,
    },
    {
      screeningId: screenings[0].id,
      userId: user.id,
      seatRow: 'A',
      seatNumber: 2,
      status: ReservationStatus.BOOKED,
      ticketType: TicketType.STUDENT,
    },
    {
      screeningId: screenings[0].id,
      userId: user.id,
      seatRow: 'A',
      seatNumber: 3,
      status: ReservationStatus.LOCKED,
      ticketType: TicketType.REGULAR,
    },
  ];

  for (const r of reservationsData) {
    await prisma.seatReservation.create({ data: r });
  }
  console.log(`Reserved ${reservationsData.length} seats.`);

  console.log('Demo entries created.');
}

main()
  .catch((e) => {
    console.error('Error while creating demo entries:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
