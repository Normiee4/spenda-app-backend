import { Router } from 'express';

import { requireAuth } from '../../middlewares/auth-handler.js';
import { getMe } from './auth.controller.js';

const router = Router();

router.get('/me', requireAuth, getMe);

export default router;
