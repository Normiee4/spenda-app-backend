import { and } from '@prisma/orm-postgres/orm-client';

import { db } from '../../config/db.js';

export async function findLogForUser(logId, userId) {
  return db.orm.public.ExpenseLog.where((expense) =>
    and(expense.id.eq(logId), expense.user_id.eq(userId)),
  ).first();
}

export async function create(logId, duration) {
  return db.orm.public.ExpenseHistory.create({
    log_id: logId,
    duration,
  });
}

export async function findAllByLog(logId, filters = {}) {
  let collection = db.orm.public.ExpenseHistory.where({ log_id: logId });

  if (filters.duration) {
    collection = collection.where({ duration: filters.duration });
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const items = await collection
    .orderBy((history) => history.created_at.desc())
    .limit(limit)
    .offset(offset)
    .all();

  const { total } = await collection.aggregate((aggregate) => ({
    total: aggregate.count(),
  }));

  return { items, total, limit, offset };
}

export default { findLogForUser, create, findAllByLog };
