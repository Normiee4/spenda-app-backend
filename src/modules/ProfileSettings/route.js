const { Router } = require('express');
const { z } = require('zod');

const ProfileSettingsController = require('./controller');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = Router();

const updateSchema = z.object({
  currency: z.string().trim().length(3, 'Use a 3-letter currency code').optional(),
  monthlyBudget: z.coerce.number().min(0).optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
  notificationsEnabled: z.boolean().optional(),
});

router.use(authenticate);

router.get('/', ProfileSettingsController.get);
router.patch('/', validate(updateSchema), ProfileSettingsController.update);

module.exports = router;
