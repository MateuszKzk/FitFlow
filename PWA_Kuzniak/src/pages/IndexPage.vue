<template>
  <q-page class="fitflow-page q-pa-md">
    <div class="fitflow-grid">
      <q-card flat bordered class="fitflow-card fitflow-hero">
        <q-card-section class="hero-head">
          <img src="/icons/Logo_FitFlow.svg" alt="FitFlow Logo" class="hero-logo">
          <div class="hero-copy">
            <div class="text-overline text-cyan-3">FitFlow PWA</div>
            <h1 class="text-h4 q-mt-none q-mb-sm text-weight-bold">Plan smarter. Train stronger.</h1>
            <div class="hero-subtitle q-mb-md">
              Kreativer Workout-Builder mit Checkbox-Uebungen, Selfie-Kamera und praeziser GPS-Ortung.
            </div>
          </div>
        </q-card-section>
        <q-separator dark />
        <q-card-section>
          <div class="text-caption text-grey-4 q-mb-sm">Live Snapshot</div>
          <div class="hero-metrics">
            <div class="metric-box">
              <div class="metric-number">{{ store.plans.length }}</div>
              <div class="metric-label">Workout Plaene</div>
            </div>
            <div class="metric-box">
              <div class="metric-number">{{ nearbyPlaces.length }}</div>
              <div class="metric-label">Nearby Spots</div>
            </div>
            <div class="metric-box">
              <div class="metric-number">{{ hasLocation ? 'GPS ON' : 'GPS OFF' }}</div>
              <div class="metric-label">Location Status</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="fitflow-card fitflow-form-card">
        <q-card-section class="section-header">
          <h2 class="text-h6 q-my-none text-weight-bold">Workout Plan Builder</h2>
          <q-chip color="green-9" text-color="green-2" dense>Quick Builder</q-chip>
        </q-card-section>
        <q-separator dark />
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.name"
            outlined
            dark
            label="Plan Name (optional)"
            placeholder="z.B. Trizeps Pump"
          />

          <q-select
            v-model="form.muscleGroup"
            outlined
            dark
            label="Muskelgruppe"
            :options="muscleGroupOptions"
            @update:model-value="onMuscleGroupChange"
          />

          <q-select
            v-model="form.focus"
            outlined
            dark
            label="Ziel"
            :options="focusOptions"
          />

          <div>
            <div class="text-subtitle2 text-cyan-3 q-mb-sm">Uebungen ankreuzen</div>
            <q-option-group
              v-model="form.exercises"
              :options="exerciseOptions"
              color="green-4"
              type="checkbox"
              inline
            />
          </div>

          <q-input
            v-model="form.notes"
            outlined
            dark
            type="textarea"
            label="Notizen (optional)"
            placeholder="Satzanzahl, Wiederholungen, Gewichte"
          />

          <div class="text-subtitle2 text-cyan-3">Progress Selfie</div>
          <div class="row q-gutter-sm items-center">
            <q-btn color="purple-4" text-color="black" icon="photo_camera" label="Selfie aufnehmen" @click="openSelfieCamera" />
            <q-file
              v-model="form.photoFile"
              outlined
              dark
              accept="image/*"
              capture="user"
              label="Oder Datei waehlen"
              clearable
              class="col"
            />
          </div>

          <q-img
            v-if="form.photoDataUrl"
            :src="form.photoDataUrl"
            class="rounded-borders"
            fit="cover"
            style="max-width: 260px; height: 170px"
          />

          <div class="row q-gutter-sm items-center">
            <q-btn color="green-5" text-color="black" :label="form.id ? 'Plan updaten' : 'Plan speichern'" @click="savePlan" />
            <q-btn flat color="grey-4" label="Reset" @click="resetForm" />
            <div v-if="form.id" class="text-cyan-3 text-caption">Bearbeite: {{ form.name || generatedPlanName }}</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="fitflow-card fitflow-plan-card">
        <q-card-section class="section-header">
          <h2 class="text-h6 q-my-none text-weight-bold">Deine Workout Plaene</h2>
          <q-chip color="deep-orange-9" text-color="orange-2" dense>Read / Update / Delete</q-chip>
        </q-card-section>
        <q-separator dark />
        <q-list dark separator v-if="store.plans.length">
          <q-item v-for="plan in store.plans" :key="plan.id" class="q-py-md">
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ plan.name }}</q-item-label>
              <q-item-label caption class="text-grey-4">Muskelgruppe: {{ plan.muscleGroup || '-' }}</q-item-label>
              <q-item-label caption class="text-grey-4">Ziel: {{ plan.focus || '-' }}</q-item-label>
              <q-item-label caption class="text-grey-5">Aktualisiert: {{ formatDate(plan.updatedAt) }}</q-item-label>
              <q-item-label class="q-mt-sm" v-if="plan.exercises?.length">
                Uebungen: {{ plan.exercises.join(', ') }}
              </q-item-label>
              <q-item-label class="q-mt-sm" v-if="plan.notes">{{ plan.notes }}</q-item-label>
              <q-img
                v-if="plan.photoDataUrl"
                :src="plan.photoDataUrl"
                class="q-mt-sm rounded-borders"
                fit="cover"
                style="max-width: 240px; height: 160px"
              />
              <div class="row q-gutter-sm q-mt-sm">
                <q-btn size="sm" color="amber-8" label="Bearbeiten" @click="loadForEdit(plan)" />
                <q-btn size="sm" color="negative" label="Loeschen" @click="store.deletePlan(plan.id)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <q-card-section v-else class="text-grey-5">
          Noch keine Workout-Plaene vorhanden.
        </q-card-section>
      </q-card>

      <q-card flat bordered class="fitflow-card fitflow-location-card">
        <q-card-section class="section-header">
          <h2 class="text-h6 q-my-none text-weight-bold">Naeheste Parks und Gyms</h2>
          <q-chip color="blue-9" text-color="blue-2" dense>GPS + Live Orte</q-chip>
        </q-card-section>
        <q-separator dark />
        <q-card-section class="q-gutter-md">
          <div class="row q-gutter-sm items-center">
            <q-btn color="cyan-5" text-color="black" label="Standort laden" :loading="locating" @click="findNearby" />
            <q-btn flat color="grey-3" label="Neu laden" :disable="!hasLocation || locating" @click="findNearby" />
            <q-select
              v-model="placeFilter"
              dense
              outlined
              dark
              label="Ortstyp"
              :options="placeFilterOptions"
              emit-value
              map-options
              class="place-filter"
            />
          </div>

          <div v-if="locationError" class="text-negative q-mb-sm">{{ locationError }}</div>
          <div v-if="positionText" class="text-cyan-2 q-mb-md">{{ positionText }}</div>

          <q-card flat bordered v-if="locationDetails" class="location-detail-panel q-pa-sm q-mb-md">
            <div class="text-caption text-cyan-3 q-mb-xs">Gefundene Location</div>
            <div class="location-grid">
              <div><span>Latitude:</span> {{ locationDetails.lat }}</div>
              <div><span>Longitude:</span> {{ locationDetails.lon }}</div>
              <div><span>Stadt:</span> {{ locationDetails.city }}</div>
              <div><span>PLZ:</span> {{ locationDetails.postcode }}</div>
              <div><span>Land:</span> {{ locationDetails.country }}</div>
              <div><span>Bundesland:</span> {{ locationDetails.state }}</div>
              <div><span>Bezirk:</span> {{ locationDetails.district }}</div>
              <div><span>Region:</span> {{ locationDetails.region }}</div>
              <div><span>Zeitpunkt:</span> {{ locationDetails.detectedAt }}</div>
            </div>
            <div class="q-mt-sm text-grey-4"><span>Adresse:</span> {{ locationDetails.displayName }}</div>
          </q-card>

          <div v-if="!locationError && !nearbyPlaces.length && hasLocation" class="text-grey-4">
            Keine Orte im Radius gefunden. Erhoehe Radius oder lade neu.
          </div>

          <q-list dark bordered separator v-if="nearbyPlaces.length">
            <q-item v-for="place in nearbyPlaces" :key="place.id">
              <q-item-section>
                <div class="row items-center q-gutter-sm">
                  <q-item-label>{{ place.name }}</q-item-label>
                  <q-chip v-if="place.isChain" dense color="pink-8" text-color="pink-2">{{ place.chainLabel }}</q-chip>
                </div>
                <q-item-label caption class="text-grey-3">
                  {{ place.type }} - {{ place.distanceKm.toFixed(2) }} km
                </q-item-label>
                <q-item-label caption class="text-grey-6">
                  {{ place.lat.toFixed(5) }}, {{ place.lon.toFixed(5) }}
                </q-item-label>
                <q-item-label v-if="place.addressLabel" caption class="text-grey-5">
                  {{ place.addressLabel }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="cameraDialog" @hide="stopCamera">
      <q-card class="camera-dialog bg-dark text-white">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Selfie Kamera</div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>
        <q-separator dark />
        <q-card-section>
          <div v-if="cameraError" class="text-negative q-mb-sm">{{ cameraError }}</div>
          <video ref="videoRef" autoplay playsinline muted class="camera-preview" />
          <canvas ref="canvasRef" class="hidden-canvas" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="grey-4" label="Abbrechen" v-close-popup />
          <q-btn color="green-5" text-color="black" label="Selfie speichern" @click="captureSelfie" :disable="!cameraReady" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, reactive, ref, onBeforeUnmount, watch } from 'vue'
import { useWorkoutStore } from 'src/stores/workout-store'

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter'
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse'
const CHAIN_NAMES = ['mcfit', 'fitinn', 'clever fit', 'cleverfit', 'fitx', 'john reed']
const VIENNA_DISTRICT_NAMES = {
  1: 'Innere Stadt',
  2: 'Leopoldstadt',
  3: 'Landstrasse',
  4: 'Wieden',
  5: 'Margareten',
  6: 'Mariahilf',
  7: 'Neubau',
  8: 'Josefstadt',
  9: 'Alsergrund',
  10: 'Favoriten',
  11: 'Simmering',
  12: 'Meidling',
  13: 'Hietzing',
  14: 'Penzing',
  15: 'Rudolfsheim-Fuenfhaus',
  16: 'Ottakring',
  17: 'Hernals',
  18: 'Waehring',
  19: 'Doebling',
  20: 'Brigittenau',
  21: 'Floridsdorf',
  22: 'Donaustadt',
  23: 'Liesing'
}

const store = useWorkoutStore()

const muscleGroupOptions = ['Trizeps', 'Brust', 'Ruecken', 'Schultern', 'Beine', 'Bizeps', 'Core']
const focusOptions = ['Muskelaufbau', 'Kraft', 'Ausdauer', 'Technik']
const exerciseCatalog = {
  Trizeps: [
    'Trizeps Pushdown',
    'Overhead Trizeps Extension',
    'Skull Crushers',
    'Bench Dips',
    'Diamond Push Ups'
  ],
  Brust: ['Bankdruecken', 'Schraegbank Kurzhantel', 'Push Ups', 'Cable Flys', 'Chest Press'],
  Ruecken: ['Latziehen', 'Rudern Kabel', 'Klimmzuege', 'Face Pulls', 'Hyperextensions'],
  Schultern: ['Seitheben', 'Shoulder Press', 'Rear Delt Fly', 'Frontheben', 'Arnold Press'],
  Beine: ['Kniebeugen', 'Beinpresse', 'Ausfallschritte', 'Rum. Deadlift', 'Beincurls'],
  Bizeps: ['Bizeps Curls', 'Hammer Curls', 'Preacher Curls', 'Cable Curls', 'Chin Ups'],
  Core: ['Plank', 'Hanging Leg Raises', 'Crunches', 'Russian Twist', 'Ab Wheel']
}

const placeFilterOptions = [
  { label: 'Alle Orte', value: 'all' },
  { label: 'Calisthenics Park', value: 'calisthenics' },
  { label: 'Gym (bezahlt)', value: 'gym' }
]

const form = reactive({
  id: null,
  name: '',
  focus: 'Muskelaufbau',
  notes: '',
  muscleGroup: 'Trizeps',
  exercises: [],
  photoFile: null,
  photoDataUrl: ''
})

const locating = ref(false)
const hasLocation = ref(false)
const locationError = ref('')
const positionText = ref('')
const nearbyPlaces = ref([])
const locationDetails = ref(null)
const placeFilter = ref('all')

const cameraDialog = ref(false)
const cameraReady = ref(false)
const cameraError = ref('')
const videoRef = ref(null)
const canvasRef = ref(null)
let cameraStream = null

const generatedPlanName = computed(() => `${form.muscleGroup || 'Workout'} Plan`)
const exerciseOptions = computed(() => {
  const list = exerciseCatalog[form.muscleGroup] || []
  return list.map((exercise) => ({ label: exercise, value: exercise }))
})

function onMuscleGroupChange() {
  const valid = new Set(exerciseCatalog[form.muscleGroup] || [])
  form.exercises = form.exercises.filter((exercise) => valid.has(exercise))
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function resetForm() {
  form.id = null
  form.name = ''
  form.focus = 'Muskelaufbau'
  form.notes = ''
  form.muscleGroup = 'Trizeps'
  form.exercises = []
  form.photoFile = null
  form.photoDataUrl = ''
}

async function savePlan() {
  if (!form.muscleGroup || form.exercises.length === 0) return

  let photoDataUrl = form.photoDataUrl
  if (!photoDataUrl && form.photoFile) {
    photoDataUrl = await toBase64(form.photoFile)
  }

  const payload = {
    name: form.name || generatedPlanName.value,
    focus: form.focus,
    notes: form.notes,
    muscleGroup: form.muscleGroup,
    exercises: [...form.exercises],
    photoDataUrl
  }

  if (form.id) {
    store.updatePlan({
      id: form.id,
      ...payload
    })
  } else {
    store.createPlan(payload)
  }

  resetForm()
}

function loadForEdit(plan) {
  form.id = plan.id
  form.name = plan.name
  form.focus = plan.focus || 'Muskelaufbau'
  form.notes = plan.notes || ''
  form.muscleGroup = plan.muscleGroup || 'Trizeps'
  form.exercises = Array.isArray(plan.exercises) ? [...plan.exercises] : []
  form.photoFile = null
  form.photoDataUrl = plan.photoDataUrl || ''
}

function formatDate(value) {
  return new Date(value).toLocaleString('de-DE')
}

function toRadians(v) {
  return (v * Math.PI) / 180
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

function getElementCoordinates(element) {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lon: element.lon }
  }
  if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
    return { lat: element.center.lat, lon: element.center.lon }
  }
  return null
}

function getTypeFromTags(tags) {
  if (tags?.sport === 'calisthenics' || tags?.leisure === 'fitness_station') return 'Calisthenics Park'
  if (tags?.amenity === 'gym' || tags?.leisure === 'fitness_centre' || tags?.sport === 'fitness') {
    return tags?.fee === 'no' ? 'Gym' : 'Gym (bezahlt)'
  }
  return 'Fitness Spot'
}

function buildAddressLabel(tags) {
  if (!tags) return ''
  const street = tags['addr:street']
  const house = tags['addr:housenumber']
  const postcode = tags['addr:postcode']
  const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village']
  const line1 = [street, house].filter(Boolean).join(' ')
  const line2 = [postcode, city].filter(Boolean).join(' ')
  return [line1, line2].filter(Boolean).join(', ')
}

function detectGymChain(tags = {}) {
  const text = `${tags.name || ''} ${tags.operator || ''} ${tags.brand || ''}`.toLowerCase()
  const match = CHAIN_NAMES.find((chain) => text.includes(chain))
  if (!match) return null
  return match
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'jsonv2',
    addressdetails: '1',
    zoom: '18',
    'accept-language': 'de'
  })

  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'de'
    }
  })

  if (!response.ok) {
    throw new Error('Reverse-Geocoding nicht verfuegbar.')
  }

  const data = await response.json()
  const address = data.address || {}
  const countryCode = (address.country_code || '').toUpperCase()
  const city = address.city || address.town || address.village || address.municipality || '-'
  const postcode = address.postcode || '-'
  const isVienna = countryCode === 'AT' && (city.toLowerCase().includes('wien') || city.toLowerCase().includes('vienna'))
  let district = address.city_district || address.suburb || address.quarter || address.neighbourhood || '-'

  if (isVienna && /^\d{4}$/.test(postcode)) {
    const n = Number(postcode) - 1000
    if (n >= 1 && n <= 23) {
      district = `${n}. Bezirk (${VIENNA_DISTRICT_NAMES[n]})`
    }
  }

  return {
    lat: Number(lat).toFixed(6),
    lon: Number(lon).toFixed(6),
    city,
    postcode,
    country: address.country || '-',
    state: isVienna ? 'Wien' : (address.state || address.province || '-'),
    district,
    region: address.county || address.state_district || '-',
    displayName: data.display_name || '-',
    detectedAt: new Date().toLocaleString('de-DE')
  }
}

function buildOverpassQuery(lat, lon, filterType) {
  const around = 15000
  const parts = []

  if (filterType !== 'calisthenics') {
    parts.push(`node(around:${around},${lat},${lon})["amenity"="gym"]`)
    parts.push(`way(around:${around},${lat},${lon})["amenity"="gym"]`)
    parts.push(`relation(around:${around},${lat},${lon})["amenity"="gym"]`)
    parts.push(`node(around:${around},${lat},${lon})["leisure"="fitness_centre"]`)
    parts.push(`way(around:${around},${lat},${lon})["leisure"="fitness_centre"]`)
    parts.push(`relation(around:${around},${lat},${lon})["leisure"="fitness_centre"]`)
    parts.push(`node(around:${around},${lat},${lon})["sport"="fitness"]`)
    parts.push(`way(around:${around},${lat},${lon})["sport"="fitness"]`)
    parts.push(`relation(around:${around},${lat},${lon})["sport"="fitness"]`)

    const chainRegex = 'McFIT|FITINN|Fitinn|Clever\\s?Fit|FitX|John\\s?Reed'
    parts.push(`node(around:${around},${lat},${lon})["name"~"${chainRegex}",i]`)
    parts.push(`way(around:${around},${lat},${lon})["name"~"${chainRegex}",i]`)
    parts.push(`relation(around:${around},${lat},${lon})["name"~"${chainRegex}",i]`)
    parts.push(`node(around:${around},${lat},${lon})["brand"~"${chainRegex}",i]`)
    parts.push(`way(around:${around},${lat},${lon})["brand"~"${chainRegex}",i]`)
    parts.push(`relation(around:${around},${lat},${lon})["brand"~"${chainRegex}",i]`)
    parts.push(`node(around:${around},${lat},${lon})["operator"~"${chainRegex}",i]`)
    parts.push(`way(around:${around},${lat},${lon})["operator"~"${chainRegex}",i]`)
    parts.push(`relation(around:${around},${lat},${lon})["operator"~"${chainRegex}",i]`)
  }

  if (filterType !== 'gym') {
    parts.push(`node(around:${around},${lat},${lon})["leisure"="fitness_station"]`)
    parts.push(`way(around:${around},${lat},${lon})["leisure"="fitness_station"]`)
    parts.push(`relation(around:${around},${lat},${lon})["leisure"="fitness_station"]`)
    parts.push(`node(around:${around},${lat},${lon})["sport"="calisthenics"]`)
    parts.push(`way(around:${around},${lat},${lon})["sport"="calisthenics"]`)
    parts.push(`relation(around:${around},${lat},${lon})["sport"="calisthenics"]`)
  }

  return `
    [out:json][timeout:25];
    (
      ${parts.join(';\n      ')};
    );
    out center 120;
  `
}

async function fetchNearbyFromOverpass(lat, lon, filterType) {
  const query = buildOverpassQuery(lat, lon, filterType)

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: `data=${encodeURIComponent(query)}`
  })

  if (!response.ok) {
    throw new Error('Orte konnten nicht vom Kartenservice geladen werden.')
  }

  const data = await response.json()
  const mapped = (data.elements || [])
    .map((element) => {
      const coords = getElementCoordinates(element)
      if (!coords) return null

      const chainLabel = detectGymChain(element.tags)
      let type = getTypeFromTags(element.tags)
      if (chainLabel && type === 'Fitness Spot') {
        type = 'Gym (bezahlt)'
      }
      const name = element.tags?.name || chainLabel || `Unnamed ${type}`

      return {
        id: `${element.type}-${element.id}`,
        name,
        type,
        lat: coords.lat,
        lon: coords.lon,
        distanceKm: getDistanceKm(lat, lon, coords.lat, coords.lon),
        addressLabel: buildAddressLabel(element.tags),
        chainLabel,
        isChain: Boolean(chainLabel)
      }
    })
    .filter(Boolean)
    .filter((place) => {
      if (filterType === 'gym') return place.type.includes('Gym')
      if (filterType === 'calisthenics') return place.type === 'Calisthenics Park'
      return true
    })

  const deduped = []
  const seen = new Set()
  for (const place of mapped) {
    const key = `${place.name}-${place.lat.toFixed(5)}-${place.lon.toFixed(5)}`
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(place)
    }
  }

  return deduped
    .sort((a, b) => {
      if (a.isChain !== b.isChain) return a.isChain ? -1 : 1
      return a.distanceKm - b.distanceKm
    })
    .slice(0, 10)
}

async function findNearby() {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation wird auf diesem Geraet nicht unterstuetzt.'
    return
  }

  locating.value = true
  locationError.value = ''
  positionText.value = ''
  nearbyPlaces.value = []
  locationDetails.value = null

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const userLat = pos.coords.latitude
      const userLon = pos.coords.longitude
      hasLocation.value = true

      positionText.value = `Aktuelle Position: ${userLat.toFixed(5)}, ${userLon.toFixed(5)}`
      locationDetails.value = await reverseGeocode(userLat, userLon)
      nearbyPlaces.value = await fetchNearbyFromOverpass(userLat, userLon, placeFilter.value)
      locating.value = false
    } catch (error) {
      locationError.value = `Standort ok, aber Orte-Lookup fehlgeschlagen: ${error.message}`
      locating.value = false
    }
  },
  (error) => {
    locationError.value = `Standort nicht verfuegbar: ${error.message}`
    hasLocation.value = false
    locating.value = false
  },
  {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0
  })
}

async function openSelfieCamera() {
  cameraError.value = ''
  cameraReady.value = false

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Kamera wird in diesem Browser nicht unterstuetzt.'
    cameraDialog.value = true
    return
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    })

    cameraDialog.value = true
    await nextTick()

    if (videoRef.value) {
      videoRef.value.srcObject = cameraStream
      await videoRef.value.play()
      cameraReady.value = true
    }
  } catch (error) {
    cameraDialog.value = true
    cameraError.value = `Kamera-Zugriff fehlgeschlagen: ${error.message}`
  }
}

function captureSelfie() {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const width = video.videoWidth || 720
  const height = video.videoHeight || 720

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  context.drawImage(video, 0, 0, width, height)
  form.photoDataUrl = canvas.toDataURL('image/jpeg', 0.92)
  form.photoFile = null

  cameraDialog.value = false
  stopCamera()
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop())
    cameraStream = null
  }
  cameraReady.value = false
}

onBeforeUnmount(() => {
  stopCamera()
})

watch(placeFilter, async () => {
  if (hasLocation.value && !locating.value) {
    await findNearby()
  }
})
</script>
