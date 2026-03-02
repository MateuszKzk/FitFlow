# FitFlow Server (MVC)

Express + PostgreSQL Backend im MVC-Stil.

## Struktur
- `src/model`: Datenzugriff (`workoutPlanModel.js`)
- `src/controller`: Request-Handling (`workoutPlanController.js`, `healthController.js`)
- `src/api/routes`: API-Routing (`workoutPlanRoutes.js`, `healthRoutes.js`)
- `src/middleware`: Fehlerbehandlung
- `boilerplate/db`: PostgreSQL Pool/Query

## Setup
```sh
npm install
copy .env.example .env
```

### PostgreSQL
Erstelle lokal die Datenbank `fitflow`:
```sh
createdb fitflow
```

## Start (Development)
```sh
npm run dev
```

## Start (Production)
```sh
npm start
```

## API
- `GET /health`
- `GET /api/workout-plans`
- `POST /api/workout-plans`
- `PUT /api/workout-plans/:id`
- `DELETE /api/workout-plans/:id`
