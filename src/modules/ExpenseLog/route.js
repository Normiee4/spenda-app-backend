import { Router } from 'express';
import { z } from 'zod';

import * as ExpenseLogController from './controller.js';
import validate from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const amount = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
    message: 'Amount must be a positive number with up to 2 decimal places',
  });

const categoryId = z.union([z.coerce.number().int().positive(), z.null()]).optional();

const createSchema = z.object({
  rawInput: z.string().trim().min(1).max(2000),
  amount,
  note: z.string().trim().max(1000).optional().default(''),
  categoryId,
});

const updateSchema = createSchema.partial();

const listQuerySchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid expense id'),
});

router.use(authenticate);

router.post('/', validate(createSchema), ExpenseLogController.create);
router.get('/', validate(listQuerySchema, 'query'), ExpenseLogController.list);
router.get('/:id', validate(idParamSchema, 'params'), ExpenseLogController.getById);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateSchema), ExpenseLogController.update);
router.delete('/:id', validate(idParamSchema, 'params'), ExpenseLogController.remove);

export default router;
