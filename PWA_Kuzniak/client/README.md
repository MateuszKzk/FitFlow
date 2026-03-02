# FitFlow (Quasar PWA + Express + PostgreSQL)

PWA fuer Workout-Planung mit Kamera-Upload, GPS-Sensor, Offline-Nutzung und Server-Sync.

## 1) PostgreSQL Setup
1. Datenbank anlegen:
```bash
createdb fitflow
```
2. Optional manuell Schema ausfuehren:
```bash
psql -d fitflow -f server/schema.sql
```
3. Server-Env anlegen:
```bash
copy server\\.env.example server\\.env
```

## 2) Starten (lokal)
Terminal A:
```bash
npm run dev:server
```
Terminal B:
```bash
npx quasar dev -m pwa
```

## 3) Production Build (PWA)
```bash
npx quasar build -m pwa
```
Output: `dist/pwa`

## Architektur
- Frontend: Quasar/Vue + Pinia
- Backend: `server/index.js` (Express API)
- Datenbank: PostgreSQL (`server/db.js`, `server/schema.sql`)
- Offline/Cache: Workbox InjectManifest (`src-pwa/custom-service-worker.js`)

## API Endpoints
- `GET /health`
- `GET /api/workout-plans`
- `POST /api/workout-plans`
- `PUT /api/workout-plans/:id`
- `DELETE /api/workout-plans/:id`

## Offline-Strategie
- UI bleibt lokal nutzbar ueber Pinia + localStorage.
- Bei Offline werden Aenderungen in eine Queue geschrieben.
- Bei Reconnect werden Queue-Items automatisch an die API gesendet.
- Service Worker cached statische Assets, Bilder und `GET /api/workout-plans`.
