const db = require('../../config/db').default;

async function create(userId, data) {
  const { rows } = await db.query(
    `INSERT INTO expenses (user_id, title, amount, category, notes, expense_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, data.title, data.amount, data.category, data.notes ?? null, data.expenseDate]
  );
  return rows[0];
}

async function findByIdForUser(id, userId) {
  const { rows } = await db.query('SELECT * FROM expenses WHERE id = $1 AND user_id = $2 LIMIT 1', [id, userId]);
  return rows[0] || null;
}

async function findAllByUser(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`category = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`expense_date >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    conditions.push(`expense_date <= $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`(title ILIKE $${params.length} OR notes ILIKE $${params.length})`);
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;
  params.push(limit, offset);

  const { rows } = await db.query(
    `SELECT *, COUNT(*) OVER() AS total_count
     FROM expenses
     WHERE ${conditions.join(' AND ')}
     ORDER BY expense_date DESC, created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const items = rows.map(({ total_count, ...row }) => row);

  return { items, total, limit, offset };
}

async function update(id, userId, data) {
  const fields = [];
  const params = [id, userId];

  const columnMap = {
    title: 'title',
    amount: 'amount',
    category: 'category',
    notes: 'notes',
    expenseDate: 'expense_date',
  };

  for (const [key, column] of Object.entries(columnMap)) {
    if (data[key] !== undefined) {
      params.push(data[key]);
      fields.push(`${column} = $${params.length}`);
    }
  }

  if (fields.length === 0) return findByIdForUser(id, userId);

  const { rows } = await db.query(
    `UPDATE expenses SET ${fields.join(', ')}, updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function remove(id, userId) {
  const { rows } = await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
  return rows[0] || null;
}

module.exports = { create, findByIdForUser, findAllByUser, update, remove };
