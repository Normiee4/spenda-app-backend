import { Router } from 'express';
import { z } from 'zod';

import * as ExpenseHistoryController from './controller.js';
import validate from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

const duration = z.enum(['DAILY', 'WEEKLY', 'MONTHLY']);

const createSchema = z.object({
  logId: z.coerce.number().int().positive(),
  duration: duration.default('DAILY'),
});

const listQuerySchema = z.object({
  logId: z.coerce.number().int().positive(),
  duration: duration.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

router.use(authenticate);

router.post('/', validate(createSchema), ExpenseHistoryController.create);
router.get('/', validate(listQuerySchema, 'query'), ExpenseHistoryController.list);

export default router;
