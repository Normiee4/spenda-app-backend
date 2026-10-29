const asyncHandler = require('../../utils/asyncHandler');
const ExpenseLogService = require('./service');

const create = asyncHandler(async (req, res) => {
  const expense = await ExpenseLogService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: expense });
});

const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await ExpenseLogService.list(req.user.id, req.query);
  res.status(200).json({ success: true, data: items, meta });
});

const getById = asyncHandler(async (req, res) => {
  const expense = await ExpenseLogService.getById(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: expense });
});

const update = asyncHandler(async (req, res) => {
  const expense = await ExpenseLogService.update(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: expense });
});

const remove = asyncHandler(async (req, res) => {
  await ExpenseLogService.remove(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: 'Expense deleted' });
});

module.exports = { create, list, getById, update, remove };
