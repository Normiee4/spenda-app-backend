import { Router } from 'express';
import { z } from 'zod';

import * as CategoryController from './controller.js';
import validate from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

router.use(authenticate);

router.get('/', CategoryController.list);
router.post('/', validate(createSchema), CategoryController.create);

export default router;
