import asyncHandler from 'express-async-handler';
import { query } from '../../boilerplate/db/index.js';

const getHealth = asyncHandler(async (_req, res) => {
  await query('SELECT 1');
  res.status(200).json({ ok: true });
});

export default getHealth;
