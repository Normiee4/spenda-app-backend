const db = require('../../config/db').default;

const PUBLIC_FIELDS = 'id, email, name, role, created_at, updated_at';

async function create({ email, passwordHash, name }) {
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING ${PUBLIC_FIELDS}`,
    [email.toLowerCase(), passwordHash, name]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1 LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findByIdWithPassword(id) {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  const { rows } = await db.query(
    `UPDATE users SET password_hash = $2, updated_at = now()
     WHERE id = $1
     RETURNING ${PUBLIC_FIELDS}`,
    [id, passwordHash]
  );
  return rows[0] || null;
}

module.exports = { create, findByEmail, findById, findByIdWithPassword, updatePassword };
