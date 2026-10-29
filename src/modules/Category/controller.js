import asyncHandler from '../../utils/asyncHandler.js';
import * as CategoryService from './service.js';

export const list = asyncHandler(async (req, res) => {
  const categories = await CategoryService.list();
  res.status(200).json({ success: true, data: categories });
});

export const create = asyncHandler(async (req, res) => {
  const category = await CategoryService.create(req.body.name);
  res.status(201).json({ success: true, data: category });
});

export default { list, create };
