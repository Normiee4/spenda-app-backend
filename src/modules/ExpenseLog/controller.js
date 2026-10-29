import asyncHandler from '../../utils/asyncHandler.js';
import * as ExpenseLogService from './service.js';

export const create = asyncHandler(async (req, res) => {
  const expense = await ExpenseLogService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: expense });
});

export const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await ExpenseLogService.list(req.user.id, req.query);
  res.status(200).json({ success: true, data: items, meta });
});

export const getById = asyncHandler(async (req, res) => {
  const expense = await ExpenseLogService.getById(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: expense });
});

export const update = asyncHandler(async (req, res) => {
  const expense = await ExpenseLogService.update(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: expense });
});

export const remove = asyncHandler(async (req, res) => {
  await ExpenseLogService.remove(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: 'Expense deleted' });
});

export default { create, list, getById, update, remove };
