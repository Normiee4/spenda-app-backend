import ApiError from '../../utils/ApiError.js';
import * as CategoryModel from './model.js';

export async function list() {
  return CategoryModel.findAll();
}

export async function create(name) {
  const existing = await CategoryModel.findByName(name);
  if (existing) throw ApiError.conflict('A category with that name already exists');
  return CategoryModel.create(name);
}

export default { list, create };
