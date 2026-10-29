import ApiError from '../../utils/ApiError.js';
import * as ExpenseHistoryModel from './model.js';

export async function create(userId, { logId, duration }) {
  const log = await ExpenseHistoryModel.findLogForUser(logId, userId);
  if (!log) throw ApiError.notFound('Expense not found');
  return ExpenseHistoryModel.create(logId, duration);
}

export async function list(userId, logId, filters) {
  const log = await ExpenseHistoryModel.findLogForUser(logId, userId);
  if (!log) throw ApiError.notFound('Expense not found');
  return ExpenseHistoryModel.findAllByLog(logId, filters);
}

export default { create, list };
