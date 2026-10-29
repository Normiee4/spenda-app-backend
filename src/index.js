import { Router } from 'express';

import authRoutes from './modules/Auth/route.js';
import expenseLogRoutes from './modules/ExpenseLog/route.js';
import expenseHistoryRoutes from './modules/ExpenseHistory/route.js';
import categoryRoutes from './modules/Category/route.js';
import profileRoutes from './modules/Profile/route.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Spenda API v1',
    endpoints: {
      auth: '/api/auth',
      expenseLogs: '/api/expenses',
      expenseHistory: '/api/expenses/history',
      categories: '/api/categories',
      profile: '/api/profile',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/expenses/history', expenseHistoryRoutes);
router.use('/expenses', expenseLogRoutes);
router.use('/categories', categoryRoutes);
router.use('/profile', profileRoutes);

export default router;
