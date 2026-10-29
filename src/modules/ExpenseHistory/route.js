const { Router } = require('express');
const { z } = require('zod');

const ExpenseHistoryController = require('./controller');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = Router();

const listQuerySchema = z.object({
  expenseId: z.string().uuid().optional(),
  action: z.enum(['created', 'updated', 'deleted']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

router.use(authenticate);

router.get('/', validate(listQuerySchema, 'query'), ExpenseHistoryController.list);

module.exports = router;
