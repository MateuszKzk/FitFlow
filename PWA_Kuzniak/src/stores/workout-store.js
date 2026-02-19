import { defineStore } from 'pinia'

const STORAGE_KEY = 'fitflow-workouts'

function loadPlans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

export const useWorkoutStore = defineStore('workouts', {
  state: () => ({
    plans: loadPlans()
  }),
  actions: {
    createPlan(plan) {
      this.plans.unshift({
        id: crypto.randomUUID(),
        name: plan.name,
        focus: plan.focus,
        notes: plan.notes,
        muscleGroup: plan.muscleGroup || '',
        exercises: Array.isArray(plan.exercises) ? plan.exercises : [],
        photoDataUrl: plan.photoDataUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      persist(this.plans)
    },
    updatePlan(payload) {
      const index = this.plans.findIndex((plan) => plan.id === payload.id)
      if (index === -1) return

      this.plans[index] = {
        ...this.plans[index],
        name: payload.name,
        focus: payload.focus,
        notes: payload.notes,
        muscleGroup: payload.muscleGroup ?? this.plans[index].muscleGroup,
        exercises: Array.isArray(payload.exercises) ? payload.exercises : this.plans[index].exercises,
        photoDataUrl: payload.photoDataUrl ?? this.plans[index].photoDataUrl,
        updatedAt: new Date().toISOString()
      }
      persist(this.plans)
    },
    deletePlan(id) {
      this.plans = this.plans.filter((plan) => plan.id !== id)
      persist(this.plans)
    }
  }
})
