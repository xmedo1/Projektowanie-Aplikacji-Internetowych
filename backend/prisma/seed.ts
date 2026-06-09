import { PrismaClient, ReservationStatus, TicketType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Creating demo entries in database.')

  const user = await prisma.user.create({
    data: {
      email: 'jankowalski@example.com',
      passwordHash: 'password', // roboczo jawnie podane hasło
      firstName: 'Jan',
    },
  })
  console.log(`Created user: ${user.email}`)

  const movie = await prisma.movie.create({
    data: {
      title: 'Titanic',
      durationMinutes: 195,
    },
  })
  console.log(`Created movie: ${movie.title}`)

  const screening = await prisma.screening.create({
    data: {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // jutro o tej samej godzinie
      roomName: 'Sala 1',
      ticketPrice: 2500, // 25zł
      movieId: movie.id,
    },
  })
  console.log(`Created screening at: ${screening.roomName}`)

  const reservation = await prisma.seatReservation.create({
    data: {
      seatRow: 'A',
      seatNumber: 1,
      status: ReservationStatus.BOOKED,
      ticketType: TicketType.STUDENT,
      userId: user.id,
      screeningId: screening.id,
    },
  })
  console.log(`Reserved a seat: Row ${reservation.seatRow}, Seat ${reservation.seatNumber}`)

  console.log('Demo entries created.')
}

main()
  .catch((e) => {
    console.error('Error while creating demo entries:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })