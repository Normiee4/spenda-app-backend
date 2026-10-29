import ApiError from '../../utils/ApiError.js';
import * as ExpenseLogModel from './model.js';

function toTimestampRange(filters) {
  return {
    ...filters,
    from: filters.from ? `${filters.from}T00:00:00.000Z` : undefined,
    to: filters.to ? `${filters.to}T23:59:59.999Z` : undefined,
  };
}

export async function create(userId, payload) {
  return ExpenseLogModel.create(userId, payload);
}

export async function list(userId, filters) {
  return ExpenseLogModel.findAllByUser(userId, toTimestampRange(filters));
}

export async function getById(userId, id) {
  const expense = await ExpenseLogModel.findByIdForUser(id, userId);
  if (!expense) throw ApiError.notFound('Expense not found');
  return expense;
}

export async function update(userId, id, payload) {
  await getById(userId, id);
  const updated = await ExpenseLogModel.update(id, userId, payload);
  if (!updated) throw ApiError.notFound('Expense not found');
  return updated;
}

export async function remove(userId, id) {
  const existing = await getById(userId, id);
  await ExpenseLogModel.remove(id, userId);
  return existing;
}

export default { create, list, getById, update, remove };
