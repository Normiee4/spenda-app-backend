import asyncHandler from '../../utils/asyncHandler.js';
import * as ExpenseHistoryService from './service.js';

export const create = asyncHandler(async (req, res) => {
  const history = await ExpenseHistoryService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: history });
});

export const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await ExpenseHistoryService.list(
    req.user.id,
    req.query.logId,
    req.query,
  );
  res.status(200).json({ success: true, data: items, meta });
});

export default { create, list };
