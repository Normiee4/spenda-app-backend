import { Router } from 'express';

import authRoutes from './modules/Auth/route';
import expenseLogRoutes from './modules/ExpenseLog/route';
import expenseHistoryRoutes from './modules/ExpenseHistory/route';
import profileSettingsRoutes from './modules/ProfileSettings/route';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Spenda API v1',
    endpoints: {
      auth: '/api/auth',
      expenseLogs: '/api/expenses',
      expenseHistory: '/api/expenses/history',
      profileSettings: '/api/profile',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/expenses/history', expenseHistoryRoutes);
router.use('/expenses', expenseLogRoutes);
router.use('/profile', profileSettingsRoutes);

export default router;
