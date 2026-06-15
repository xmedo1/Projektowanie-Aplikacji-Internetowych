# Projektowanie-Aplikacji-Internetowych
Projekt na zaliczenie przedmiotu Projektowanie Aplikacji Internetowych w semestrze letnim 2025/26.

System rezerwacji miejsc w kinie. Użytkownikom umożliwia przegląd filmów oraz seansów, rezerwację i zakup biletów (normalnych i ulgowych) oraz wyświetlenie biletów i zarządzanie swoim kontem. Administratorowi dodatkowo umożliwia zarządzanie (dodawanie, usuwanie, aktualizowanie) filmami, seansami, rezerwacjami i użytkownikami. Dodatkowo dla admina przygotowany jest panel ze statystykami, takimi jak dochód z biletów, liczba użytkowników oraz filmów w bazie.

## Opis architektury
- **Backend:** Node.js, Express.js, TypeScript (z dokumentacją Swagger)
- **Baza danych:** PostgreSQL, Prisma ORM
- **Frontend:** React, Vite, TypeScript
- **Infrastruktura:** Docker, Docker Compose z health-check

Szczegółowy opis architektury znajduje się w pliku [ADR.pdf](https://github.com/xmedo1/Projektowanie-Aplikacji-Internetowych/blob/main/ADR.pdf)

## Instrukcja uruchomienia

> [!IMPORTANT]  
> Upewnij się, że masz zainstalowane:
> - Node.js, w wersji 20+ (dla uruchomienia lokalnego)
> - Docker, do uruchomienia bazy PostgreSQL

> [!NOTE]  
> Pamiętaj sklonowaniu repo i o podmianie pliku `.env.example:`
> ```bash
> git clone https://github.com/xmedo1/Projektowanie-Aplikacji-Internetowych
> cd Projektowanie-Aplikacji-Internetowych/
> cp .env.example .env
> ```

### 1. Uruchomienie przez docker-compose (zalecane)

```bash
# Uruchomienie aplikacji
docker compose up --build -d

# Zatrzymanie kontenerów i usunięcie wolumenu
docker compose down -v
```

### 2. Uruchomienie lokalne

Uruchom bazę danych
```bash
docker compose up db -d
```

W katalogu `backend/`:
```bash
# Instalacja zależności
npm install

# Generowanie klienta Prisma i wgrywanie migracji
npx prisma generate
npx prisma migrate deploy

# Uruchom serwer w trybie `dev`
npm run dev
```
Backend działa pod adresem `http://localhost:3000`.

W katalogu `frontend/`
```bash
# Instalacja zależności
npm install

# Uruchom serwer w trybie `dev`
npm run dev
```
Frontend działa pod adresem `http://localhost:5173`

## Przykładowe dane

Aplikacja umożliwia wygenerowanie przykładowych danych do demonstracji sytemu, aby to zrobić uruchom skrypt `seed.sh` w głównym katalogu projektu:

```bash
./seed.sh
```

To polecenie wygeneruje przykładowe filmy, seanse, rezerwacje oraz dwa konta użytkowników:

- Zwykły użytkownik (e-mail: `jankowalski@example.com`; hasło: `password`)
- Administrator (e-mail: `admin@example.com`; hasło: `password`)

## Dokumentacja API

Dokumentacja API jest zapewniana przez Swagger w formacie OpenAPI, i dostępna pod adresem `http://localhost:3000/api-docs` po uruchomieniu kodu backendu.
