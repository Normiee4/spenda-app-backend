const db = require('../../config/db').default;

async function create({ expenseId, userId, action, snapshot }) {
  const { rows } = await db.query(
    `INSERT INTO expense_history (expense_id, user_id, action, snapshot)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [expenseId, userId, action, snapshot]
  );
  return rows[0];
}

async function findAllByUser(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (filters.expenseId) {
    params.push(filters.expenseId);
    conditions.push(`expense_id = $${params.length}`);
  }
  if (filters.action) {
    params.push(filters.action);
    conditions.push(`action = $${params.length}`);
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;
  params.push(limit, offset);

  const { rows } = await db.query(
    `SELECT *, COUNT(*) OVER() AS total_count
     FROM expense_history
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const items = rows.map(({ total_count, ...row }) => row);

  return { items, total, limit, offset };
}

module.exports = { create, findAllByUser };
