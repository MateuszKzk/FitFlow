import { randomUUID } from 'crypto';
import asyncHandler from 'express-async-handler';
import * as model from '../model/workoutPlanModel.js';

function normalizePayload(input = {}) {
  return {
    id: input.id || randomUUID(),
    name: String(input.name || 'Workout Plan'),
    focus: String(input.focus || ''),
    notes: String(input.notes || ''),
    muscleGroup: String(input.muscleGroup || ''),
    exercises: Array.isArray(input.exercises) ? input.exercises : [],
    photoDataUrl: String(input.photoDataUrl || ''),
    updatedAt: new Date().toISOString(),
  };
}

export const getWorkoutPlans = asyncHandler(async (_req, res) => {
  const plans = await model.getAllWorkoutPlans();
  res.status(200).json(plans);
});

export const createWorkoutPlan = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);
  const created = await model.createWorkoutPlan(payload);
  res.status(201).json(created);
});

export const updateWorkoutPlan = asyncHandler(async (req, res) => {
  const payload = normalizePayload({ ...req.body, id: req.params.id });
  const updated = await model.updateWorkoutPlan(req.params.id, payload);

  if (!updated) {
    res.status(404).json({ error: 'Workout plan not found' });
    return;
  }

  res.status(200).json(updated);
});

export const deleteWorkoutPlan = asyncHandler(async (req, res) => {
  const deleted = await model.deleteWorkoutPlan(req.params.id);

  if (!deleted) {
    res.status(404).json({ error: 'Workout plan not found' });
    return;
  }

  res.status(204).end();
});
