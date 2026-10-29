import { Router } from 'express';
import { z } from 'zod';

import * as ProfileController from './controller.js';
import validate from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

const updateSchema = z
  .object({
    displayName: z.string().trim().max(80).nullable().optional(),
    avatarUrl: z.string().url().max(2048).nullable().optional(),
    isDarkmode: z.boolean().optional(),
    allowNotifications: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

router.use(authenticate);

router.get('/', ProfileController.get);
router.patch('/', validate(updateSchema), ProfileController.update);

export default router;
