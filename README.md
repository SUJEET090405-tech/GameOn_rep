# Gameon turf booking

A React and Spring Boot application for Gameon: find local football turfs, reserve a slot, discover and register teams for tournaments, and publish fixtures, live scores, and results. Data is stored in MySQL.

## Requirements

- Node.js 20.19+ and npm
- Java 21+
- Maven 3.6.3+
- Docker Desktop (optional, for the included local MySQL service; the `local` Spring profile uses in-memory H2)

## Run locally

1. Choose a database:

   For a quick local run, the API can use the `local` profile and in-memory H2; no Docker or MySQL setup is required.

   ```powershell
   # No separate database command is needed for the local profile.
   ```

   To use MySQL instead:

   ```powershell
   docker compose up -d db
   ```

2. In a terminal, start the API with the matching database:

   ```powershell
   $env:ORGANIZER_API_KEY = "choose-a-local-organizer-key"
   cd server
   # Choose one:
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   # Or, after starting MySQL:
   mvn spring-boot:run
   ```

   The API creates the schema and sample turf and tournament records on its first start. Default local database settings are in `server/src/main/resources/application.properties`; override them with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` as needed. Set `ORGANIZER_API_KEY` to a private value before using organizer tools; the built-in fallback is for local development only.

3. In another terminal, install frontend dependencies and start the web app:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The Vite development server proxies `/api` requests to `http://localhost:8080`.

## Vercel and GitHub

The `vercel.json` file configures Vercel to build and serve the React frontend. The Spring Boot API and MySQL database must be hosted separately; Vercel does not run this Spring Boot service as a standard Vite deployment.

1. Push the project to a GitHub repository you control, then import that repository into Vercel.
2. In Vercel project settings, add `VITE_API_BASE_URL` with the deployed API base URL ending in `/api` (for example, `https://your-api-host.example/api`).
3. Configure the API host with its production `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `ORGANIZER_API_KEY`, and `CORS_ALLOWED_ORIGIN` (the Vercel site origin).
4. Redeploy the Vercel project after setting the environment variables.

Do not use the local H2 profile or the default organizer key in production. Use HTTPS and a managed MySQL database for a deployed application.

## Tests and production build

```powershell
cd server
mvn test
```

```powershell
cd client
npm run build
```

## API

- `GET /api/turfs` — list turfs
- `GET /api/turfs/{turfId}/availability?date=YYYY-MM-DD` — list booked slots for a day
- `POST /api/bookings` — reserve a slot; returns `409 Conflict` if another request has already booked it
- `GET /api/tournaments?location=Bengaluru` — discover tournaments by city, venue, or name
- `GET /api/tournaments/{id}` — tournament details, fixtures, live scores, and results
- `POST /api/tournaments/{id}/registrations` — register a team
- `POST /api/organizer/verify` — validate the `X-Organizer-Key` header
- `POST /api/tournaments` — publish a tournament (organizer key required)
- `POST /api/tournaments/{id}/fixtures` — create a fixture (organizer key required)
- `PATCH /api/fixtures/{id}/score` — publish a score and match status (organizer key required)
- `PATCH /api/tournaments/{id}/status` — change tournament status (organizer key required)

The public tournament board refreshes every 15 seconds and the open fixture/results view refreshes every 10 seconds. Organizers create fixtures manually, then update match scores and status from the fixture view.

Organizer access currently uses one shared API key configured with `ORGANIZER_API_KEY`, rather than separate organizer accounts. Use a private key and HTTPS outside local development.

Example booking:

```json
{
  "turfId": 1,
  "date": "2026-12-01",
  "timeSlot": "06:00 PM - 07:00 PM",
  "customerName": "Aarav Patel",
  "email": "aarav@example.com",
  "phone": "+91 98765 43210"
}
```

The sample turfs and images are demo content. Replace them with your venue details before launch. The compose database credentials are for local development only.
