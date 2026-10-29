import { Router } from 'express';
import { z } from 'zod';

import * as AuthController from './controller.js';
import validate from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

const updateMeSchema = z
  .object({
    username: z.string().trim().min(3).max(30).optional(),
    name: z.string().trim().min(1).max(80).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

router.get('/me', authenticate, AuthController.me);
router.patch('/me', authenticate, validate(updateMeSchema), AuthController.updateMe);

export default router;
