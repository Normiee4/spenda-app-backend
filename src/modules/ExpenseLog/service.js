const ApiError = require('../../utils/ApiError');
const ExpenseLogModel = require('./model');
const ExpenseHistoryModel = require('../ExpenseHistory/model');

async function recordHistory(expense, userId, action) {
  await ExpenseHistoryModel.create({
    expenseId: expense.id,
    userId,
    action,
    snapshot: expense,
  });
}

async function create(userId, payload) {
  const expense = await ExpenseLogModel.create(userId, payload);
  await recordHistory(expense, userId, 'created');
  return expense;
}

async function list(userId, filters) {
  return ExpenseLogModel.findAllByUser(userId, filters);
}

async function getById(userId, id) {
  const expense = await ExpenseLogModel.findByIdForUser(id, userId);
  if (!expense) throw ApiError.notFound('Expense not found');
  return expense;
}

async function update(userId, id, payload) {
  const existing = await getById(userId, id);
  const updated = await ExpenseLogModel.update(id, userId, payload);
  await recordHistory({ ...updated, previous: existing }, userId, 'updated');
  return updated;
}

async function remove(userId, id) {
  const existing = await getById(userId, id);
  const deleted = await ExpenseLogModel.remove(id, userId);
  await recordHistory(deleted, userId, 'deleted');
  return existing;
}

module.exports = { create, list, getById, update, remove };
