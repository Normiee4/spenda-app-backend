import { and, or } from '@prisma/orm-postgres/orm-client';

import { db } from '../../config/db.js';

function buildWhere(userId, filters) {
  return (expense) => {
    const parts = [expense.user_id.eq(userId)];

    if (filters.categoryId !== undefined && filters.categoryId !== null) {
      parts.push(expense.category_id.eq(filters.categoryId));
    }

    if (filters.from) {
      parts.push(expense.created_at.gte(filters.from));
    }

    if (filters.to) {
      parts.push(expense.created_at.lte(filters.to));
    }

    if (filters.search) {
      const pattern = `%${filters.search}%`;
      parts.push(or(expense.raw_input.ilike(pattern), expense.note.ilike(pattern)));
    }

    return and(...parts);
  };
}

export async function create(userId, data) {
  return db.orm.public.ExpenseLog.create({
    raw_input: data.rawInput,
    amount: data.amount,
    note: data.note ?? '',
    user_id: userId,
    category_id: data.categoryId ?? null,
  });
}

export async function findByIdForUser(id, userId) {
  return db.orm.public.ExpenseLog.where((expense) =>
    and(expense.id.eq(id), expense.user_id.eq(userId)),
  ).first();
}

export async function findAllByUser(userId, filters = {}) {
  const where = buildWhere(userId, filters);
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const items = await db.orm.public.ExpenseLog.where(where)
    .orderBy((expense) => expense.created_at.desc())
    .limit(limit)
    .offset(offset)
    .all();

  const { total } = await db.orm.public.ExpenseLog.where(where).aggregate((aggregate) => ({
    total: aggregate.count(),
  }));

  return { items, total, limit, offset };
}

export async function update(id, userId, data) {
  const patch = {};

  if (data.rawInput !== undefined) patch.raw_input = data.rawInput;
  if (data.amount !== undefined) patch.amount = data.amount;
  if (data.note !== undefined) patch.note = data.note;
  if (data.categoryId !== undefined) patch.category_id = data.categoryId;

  return db.orm.public.ExpenseLog.where((expense) =>
    and(expense.id.eq(id), expense.user_id.eq(userId)),
  ).update(patch);
}

export async function remove(id, userId) {
  return db.orm.public.ExpenseLog.where((expense) =>
    and(expense.id.eq(id), expense.user_id.eq(userId)),
  ).delete();
}

export default { create, findByIdForUser, findAllByUser, update, remove };
