import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import healthRoutes from './api/routes/healthRoutes.js';
import workoutPlanRoutes from './api/routes/workoutPlanRoutes.js';
import { initWorkoutPlansTable } from './model/workoutPlanModel.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

app.use(morgan(process.env.MODE === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(currentDir, '..', '..', 'public')));

app.use('/health', healthRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

initWorkoutPlansTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`FitFlow MVC server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  });

export default app;
