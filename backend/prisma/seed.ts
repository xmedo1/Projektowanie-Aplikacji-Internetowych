import { ReservationStatus, TicketType, Role } from '@prisma/client';
import { prisma } from '../src/db.js';

async function main() {
  console.log('Deleting old entries...');
  await prisma.seatReservation.deleteMany();
  await prisma.screening.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

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

  const createdMovies = [];
  for (const m of moviesData) {
    const movie = await prisma.movie.create({ data: m });
    createdMovies.push(movie);
    console.log(`Created movie: ${movie.title}`);
  }

  const screening = await prisma.screening.create({
    data: {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // jutro o tej samej godzinie
      roomName: 'Sala 1',
      ticketPrice: 2500, // 25zł
      movieId: createdMovies[0].id,
    },
  });
  console.log(`Created screening at: ${screening.roomName}`);

  const reservation = await prisma.seatReservation.create({
    data: {
      seatRow: 'A',
      seatNumber: 1,
      status: ReservationStatus.BOOKED,
      ticketType: TicketType.STUDENT,
      userId: user.id,
      screeningId: screening.id,
    },
  });
  console.log(`Reserved a seat: Row ${reservation.seatRow}, Seat ${reservation.seatNumber}`);

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
