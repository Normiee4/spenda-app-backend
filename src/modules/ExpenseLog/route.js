const { Router } = require('express');
const { z } = require('zod');

const ExpenseLogController = require('./controller');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = Router();

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z.string().trim().min(1).max(60),
  notes: z.string().trim().max(1000).optional().nullable(),
  expenseDate: dateString,
});

const updateSchema = createSchema.partial();

const listQuerySchema = z.object({
  category: z.string().trim().max(60).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const idParamSchema = z.object({
  id: z.string().uuid('Invalid expense id'),
});

router.use(authenticate);

router.post('/', validate(createSchema), ExpenseLogController.create);
router.get('/', validate(listQuerySchema, 'query'), ExpenseLogController.list);
router.get('/:id', validate(idParamSchema, 'params'), ExpenseLogController.getById);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateSchema), ExpenseLogController.update);
router.delete('/:id', validate(idParamSchema, 'params'), ExpenseLogController.remove);

module.exports = router;
