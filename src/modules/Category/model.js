import { db } from '../../config/db.js';

export async function findAll() {
  return db.orm.public.Category.orderBy((category) => category.name.asc()).all();
}

export async function findByName(name) {
  return db.orm.public.Category.where({ name }).first();
}

export async function create(name) {
  return db.orm.public.Category.create({ name });
}

export default { findAll, findByName, create };
