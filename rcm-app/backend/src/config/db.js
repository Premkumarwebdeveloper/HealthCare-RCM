const { Pool, types } = require('pg');
const env = require('./env');

// Return DATE as 'YYYY-MM-DD', NUMERIC as number, BIGINT as number.
types.setTypeParser(1082, (v) => v);
types.setTypeParser(1700, (v) => parseFloat(v));
types.setTypeParser(20, (v) => parseInt(v, 10));

const pool = new Pool({ connectionString: env.DATABASE_URL, max: 10 });

const query = (text, params) => pool.query(text, params);

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
