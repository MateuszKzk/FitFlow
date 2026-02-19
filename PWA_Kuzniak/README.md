# FitFlow (Quasar PWA)

PWA fuer Workout-Planung mit Kamera-Upload, GPS-Sensor und persistenter Speicherung.

## Start
```bash
npm install
npx quasar dev -m pwa
```

## Production Build (PWA)
```bash
npx quasar build -m pwa
```
Output: `dist/pwa`

## Bewertungs-Checkliste
1. Service Worker wird geladen: PWA-Mode nutzen (`quasar dev -m pwa`) und in DevTools unter Application -> Service Workers pruefen.
2. Installierbar: Manifest ist in `quasar.config.js` konfiguriert (Name, Icons, theme/background, standalone).
3. CRD/CRU: Workout-Plaene koennen erstellt, gelesen, bearbeitet und geloescht werden.
4. Workbox: Runtime-Caching fuer statische Assets und Bilder in `extendGenerateSWOptions`.
5. Sensor: GPS ueber `navigator.geolocation.getCurrentPosition(...)`, Kamera ueber File-Input mit `capture=\"environment\"`.
6. Persistenz: Pinia Store in `src/stores/workout-store.js` mit `localStorage`.
7. Release-Abgabe: GitHub Release mit Tag erstellen und den direkten Link zur Release-Seite abgeben.

## GitHub Release erstellen
```bash
git add .
git commit -m "Implement FitFlow PWA with camera, GPS, Pinia persistence and Workbox caching"
git push origin main
```
Dann in GitHub:
1. `Releases` -> `Draft a new release`
2. Tag z.B. `v1.0.0` erstellen
3. Titel/Beschreibung eintragen und `Publish release`
4. Den direkten Release-Link abgeben (nicht nur Repo-Link)
