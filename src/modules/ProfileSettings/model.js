const db = require('../../config/db').default;

async function findByUserId(userId) {
  const { rows } = await db.query('SELECT * FROM profile_settings WHERE user_id = $1 LIMIT 1', [userId]);
  return rows[0] || null;
}

async function createDefault(userId) {
  const { rows } = await db.query(
    `INSERT INTO profile_settings (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
     RETURNING *`,
    [userId]
  );
  return rows[0];
}

async function update(userId, data) {
  const fields = [];
  const params = [userId];

  const columnMap = {
    currency: 'currency',
    monthlyBudget: 'monthly_budget',
    timezone: 'timezone',
    notificationsEnabled: 'notifications_enabled',
  };

  for (const [key, column] of Object.entries(columnMap)) {
    if (data[key] !== undefined) {
      params.push(data[key]);
      fields.push(`${column} = $${params.length}`);
    }
  }

  if (fields.length === 0) return findByUserId(userId);

  const { rows } = await db.query(
    `UPDATE profile_settings SET ${fields.join(', ')}, updated_at = now()
     WHERE user_id = $1
     RETURNING *`,
    params
  );
  return rows[0] || null;
}

module.exports = { findByUserId, createDefault, update };
