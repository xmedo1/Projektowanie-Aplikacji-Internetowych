export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Kino API',
    version: '1.0',
    description: 'API systemu rezerwacji biletów kinowych.',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
    },
    schemas: {
      Movie: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          durationMinutes: { type: 'integer' },
        },
      },
      Screening: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          movieId: { type: 'integer' },
          startTime: { type: 'string', format: 'date-time' },
          roomName: { type: 'string' },
          ticketPrice: { type: 'integer', description: 'Cena w groszach (np. 2500 = 25 zł)' },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          seatRow: { type: 'string' },
          seatNumber: { type: 'integer' },
          ticketType: { type: 'string', enum: ['REGULAR', 'STUDENT'] },
          status: { type: 'string', enum: ['LOCKED', 'BOOKED'] },
          userId: { type: 'integer' },
          screeningId: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          createdAt: { type: 'string', format: 'date-time' }
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/movies': {
      get: {
        tags: ['Movies'],
        summary: 'Lista wszystkich filmów',
        responses: {
          200: {
            description: 'Lista filmów',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Movie' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Movies'],
        summary: 'Dodaj film (admin)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'durationMinutes'],
                properties: {
                  title: { type: 'string' },
                  durationMinutes: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Film dodany' },
          403: { description: 'Brak uprawnień' },
        },
      },
    },
    '/movies/{id}': {
      get: {
        tags: ['Movies'],
        summary: 'Szczegóły filmu z seansami',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Film' },
          404: { description: 'Nie znaleziono' },
        },
      },
      put: {
        tags: ['Movies'],
        summary: 'Aktualizuj film (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  durationMinutes: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Film zaktualizowany' },
          403: { description: 'Brak uprawnień' },
        },
      },
      delete: {
        tags: ['Movies'],
        summary: 'Usuń film (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Film usunięty' },
          400: { description: 'Nie można usunąć — przypisane seanse' },
        },
      },
    },
    '/screenings': {
      get: {
        tags: ['Screenings'],
        summary: 'Lista wszystkich seansów',
        responses: {
          200: { description: 'Lista seansów' },
        },
      },
      post: {
        tags: ['Screenings'],
        summary: 'Dodaj seans (admin)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['movieId', 'startTime', 'ticketPrice', 'roomName'],
                properties: {
                  movieId: { type: 'integer' },
                  startTime: { type: 'string', format: 'date-time' },
                  ticketPrice: { type: 'integer' },
                  roomName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Seans dodany' },
        },
      },
    },
    '/screenings/{id}': {
      get: {
        tags: ['Screenings'],
        summary: 'Szczegóły seansu z miejscami',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Seans z listą zarezerwowanych miejsc' },
          404: { description: 'Nie znaleziono' },
        },
      },
      put: {
        tags: ['Screenings'],
        summary: 'Aktualizuj seans (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  movieId: { type: 'integer' },
                  startTime: { type: 'string', format: 'date-time' },
                  ticketPrice: { type: 'integer' },
                  roomName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Seans zaktualizowany' },
        },
      },
      delete: {
        tags: ['Screenings'],
        summary: 'Usuń seans (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Seans usunięty' },
        },
      },
    },
    '/reservations': {
      get: {
        tags: ['Reservations'],
        summary: 'Lista wszystkich rezerwacji (admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Lista rezerwacji' },
          403: { description: 'Brak uprawnień' },
        },
      },
      post: {
        tags: ['Reservations'],
        summary: 'Utwórz rezerwację',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['screeningId', 'seatRow', 'seatNumber', 'ticketType'],
                properties: {
                  screeningId: { type: 'integer' },
                  seatRow: { type: 'string' },
                  seatNumber: { type: 'integer' },
                  ticketType: { type: 'string', enum: ['REGULAR', 'STUDENT'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Rezerwacja utworzona (status: LOCKED)' },
          409: { description: 'Miejsce już zajęte' },
        },
      },
    },
    '/reservations/{id}': {
      put: {
        tags: ['Reservations'],
        summary: 'Aktualizuj rezerwację (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['LOCKED', 'BOOKED'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Zaktualizowano' },
        },
      },
      delete: {
        tags: ['Reservations'],
        summary: 'Usuń rezerwację (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Usunięto' },
        },
      },
    },
    '/reservations/{id}/pay': {
      patch: {
        tags: ['Reservations'],
        summary: 'Opłać rezerwację (5 minut od utworzenia)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Płatność potwierdzona' },
          400: { description: 'Już opłacona lub czas minął' },
          403: { description: 'Nie jesteś właścicielem rezerwacji' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Rejestracja',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string', minLength: 2 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Konto utworzone' },
          409: { description: 'Email już w użyciu' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Logowanie — ustawia httpOnly cookie',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'jankowalski@example.com' },
                  password: { type: 'string', example: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Zalogowano, cookie ustawione' },
          401: { description: 'Nieprawidłowe dane' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Wylogowanie — czyści cookie',
        responses: {
          200: { description: 'Wylogowano' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Dane zalogowanego użytkownika',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Dane użytkownika' },
          401: { description: 'Niezalogowany' },
        },
      },
    },
    '/auth/my-reservations': {
      get: {
        tags: ['Auth'],
        summary: 'Rezerwacje zalogowanego użytkownika',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Lista rezerwacji z seansami i filmami' },
        },
      },
    },
    '/auth/update-profile': {
      put: {
        tags: ['Auth'],
        summary: 'Aktualizuj profil',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profil zaktualizowany' },
          400: { description: 'Nieprawidłowe dane' },
          409: { description: 'Email już w użyciu' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Lista użytkowników (admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Lista użytkowników z historią rezerwacji' },
          403: { description: 'Brak uprawnień' },
        },
      },
    },
    '/users/{id}/role': {
      put: {
        tags: ['Users'],
        summary: 'Zmień rolę użytkownika (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['USER', 'ADMIN'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Rola zaktualizowana' },
        },
      },
    },
    '/users/{id}': {
      delete: {
        tags: ['Users'],
        summary: 'Usuń użytkownika (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Użytkownik usunięty' },
          400: { description: 'Nie można usunąć — posiada rezerwacje' },
        },
      },
    },
    '/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Statystyki systemu (admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Statystyki',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalMovies: { type: 'integer' },
                    totalScreenings: { type: 'integer' },
                    totalUsers: { type: 'integer' },
                    totalRevenue: { type: 'integer' },
                    ticketsNormal: { type: 'integer' },
                    ticketsStudent: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: { description: 'API działa' },
        },
      },
    },
  },
};