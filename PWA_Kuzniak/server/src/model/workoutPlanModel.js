import { query } from '../../boilerplate/db/index.js';

export async function initWorkoutPlansTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      focus TEXT,
      notes TEXT,
      muscle_group TEXT,
      exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
      photo_data_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    focus: row.focus || '',
    notes: row.notes || '',
    muscleGroup: row.muscle_group || '',
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
    photoDataUrl: row.photo_data_url || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllWorkoutPlans() {
  const { rows } = await query(`
    SELECT id, name, focus, notes, muscle_group, exercises, photo_data_url, created_at, updated_at
    FROM workout_plans
    ORDER BY updated_at DESC
  `);
  return rows.map(mapRow);
}

export async function createWorkoutPlan(payload) {
  const { rows } = await query(
    `
      INSERT INTO workout_plans (id, name, focus, notes, muscle_group, exercises, photo_data_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $8)
      RETURNING id, name, focus, notes, muscle_group, exercises, photo_data_url, created_at, updated_at
    `,
    [
      payload.id,
      payload.name,
      payload.focus || '',
      payload.notes || '',
      payload.muscleGroup || '',
      JSON.stringify(Array.isArray(payload.exercises) ? payload.exercises : []),
      payload.photoDataUrl || '',
      payload.updatedAt,
    ],
  );
  return mapRow(rows[0]);
}

export async function updateWorkoutPlan(id, payload) {
  const { rows, rowCount } = await query(
    `
      UPDATE workout_plans
      SET
        name = $2,
        focus = $3,
        notes = $4,
        muscle_group = $5,
        exercises = $6::jsonb,
        photo_data_url = $7,
        updated_at = $8
      WHERE id = $1
      RETURNING id, name, focus, notes, muscle_group, exercises, photo_data_url, created_at, updated_at
    `,
    [
      id,
      payload.name,
      payload.focus || '',
      payload.notes || '',
      payload.muscleGroup || '',
      JSON.stringify(Array.isArray(payload.exercises) ? payload.exercises : []),
      payload.photoDataUrl || '',
      payload.updatedAt,
    ],
  );

  if (!rowCount) return null;
  return mapRow(rows[0]);
}

export async function deleteWorkoutPlan(id) {
  const { rowCount } = await query('DELETE FROM workout_plans WHERE id = $1', [id]);
  return rowCount > 0;
}
