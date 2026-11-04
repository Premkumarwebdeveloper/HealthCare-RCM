const { query } = require('../config/db');

const findByUsername = async (username) => {
  const { rows } = await query(
    'SELECT id, username, full_name, role, password_hash FROM users WHERE LOWER(username) = LOWER($1)',
    [username],
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await query('SELECT id, username, full_name, role FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

module.exports = { findByUsername, findById };
