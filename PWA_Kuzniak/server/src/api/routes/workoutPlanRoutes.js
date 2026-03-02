import express from 'express';
import {
  createWorkoutPlan,
  deleteWorkoutPlan,
  getWorkoutPlans,
  updateWorkoutPlan,
} from '../../controller/workoutPlanController.js';

const router = express.Router();

router.get('/', getWorkoutPlans);
router.post('/', createWorkoutPlan);
router.put('/:id', updateWorkoutPlan);
router.delete('/:id', deleteWorkoutPlan);

export default router;
