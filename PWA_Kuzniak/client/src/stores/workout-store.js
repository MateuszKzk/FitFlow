import { defineStore } from 'pinia'

const STORAGE_KEY = 'fitflow-workouts'
const QUEUE_KEY = 'fitflow-workout-sync-queue'
const API_BASE = (process.env.API_BASE_URL || '').replace(/\/$/, '')
const API_URL = `${API_BASE}/api/workout-plans`

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function persistJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    throw new Error(`API error ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function normalizePlan(plan) {
  return {
    id: plan.id,
    name: plan.name || 'Workout Plan',
    focus: plan.focus || '',
    notes: plan.notes || '',
    muscleGroup: plan.muscleGroup || '',
    exercises: Array.isArray(plan.exercises) ? plan.exercises : [],
    photoDataUrl: plan.photoDataUrl || '',
    createdAt: plan.createdAt || new Date().toISOString(),
    updatedAt: plan.updatedAt || new Date().toISOString()
  }
}

export const useWorkoutStore = defineStore('workouts', {
  state: () => ({
    plans: loadJson(STORAGE_KEY, []),
    queue: loadJson(QUEUE_KEY, []),
    initialized: false,
    syncing: false,
    lastSyncAt: null
  }),
  actions: {
    setupOnlineListener() {
      if (typeof window === 'undefined' || this.initialized) return

      window.addEventListener('online', () => {
        this.syncWithServer().catch(() => {})
      })
    },

    persistLocal() {
      persistJson(STORAGE_KEY, this.plans)
      persistJson(QUEUE_KEY, this.queue)
    },

    enqueue(action) {
      this.queue.push(action)
      this.persistLocal()
    },

    async sendAction(action) {
      if (action.type === 'create') {
        await apiRequest(API_URL, {
          method: 'POST',
          body: JSON.stringify(action.plan)
        })
        return
      }

      if (action.type === 'update') {
        await apiRequest(`${API_URL}/${action.id}`, {
          method: 'PUT',
          body: JSON.stringify(action.plan)
        })
        return
      }

      if (action.type === 'delete') {
        await apiRequest(`${API_URL}/${action.id}`, {
          method: 'DELETE'
        })
      }
    },

    async flushQueue() {
      if (!navigator.onLine || !this.queue.length) return

      while (this.queue.length) {
        const action = this.queue[0]
        await this.sendAction(action)
        this.queue.shift()
        this.persistLocal()
      }
    },

    async fetchServerPlans() {
      const serverPlans = await apiRequest(API_URL)
      this.plans = serverPlans.map(normalizePlan)
      this.lastSyncAt = new Date().toISOString()
      this.persistLocal()
    },

    async syncWithServer() {
      if (this.syncing) return
      this.syncing = true

      try {
        if (navigator.onLine) {
          await this.flushQueue()
          await this.fetchServerPlans()
        }
      } catch {
        // stay on local cache when API is not reachable
      } finally {
        this.syncing = false
      }
    },

    async initStore() {
      this.setupOnlineListener()
      this.initialized = true
      await this.syncWithServer()
    },

    async createPlan(plan) {
      const entry = normalizePlan({
        ...plan,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      this.plans.unshift(entry)
      this.persistLocal()

      const action = { type: 'create', plan: entry }
      if (navigator.onLine) {
        try {
          await this.sendAction(action)
          await this.fetchServerPlans()
          return
        } catch {
          this.enqueue(action)
          return
        }
      }

      this.enqueue(action)
    },

    async updatePlan(payload) {
      const index = this.plans.findIndex((plan) => plan.id === payload.id)
      if (index === -1) return

      const updated = normalizePlan({
        ...this.plans[index],
        ...payload,
        updatedAt: new Date().toISOString()
      })

      this.plans[index] = updated
      this.persistLocal()

      const action = { type: 'update', id: payload.id, plan: updated }
      if (navigator.onLine) {
        try {
          await this.sendAction(action)
          await this.fetchServerPlans()
          return
        } catch {
          this.enqueue(action)
          return
        }
      }

      this.enqueue(action)
    },

    async deletePlan(id) {
      this.plans = this.plans.filter((plan) => plan.id !== id)
      this.persistLocal()

      const action = { type: 'delete', id }
      if (navigator.onLine) {
        try {
          await this.sendAction(action)
          await this.fetchServerPlans()
          return
        } catch {
          this.enqueue(action)
          return
        }
      }

      this.enqueue(action)
    }
  }
})
