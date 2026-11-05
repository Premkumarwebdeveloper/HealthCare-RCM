const app = require('./app');
const env = require('./config/env');
const { pool, checkConnection } = require('./config/db');

async function startServer() {
  try {
    await checkConnection();
    console.info('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    await pool.end();
    process.exitCode = 1;
    return;
  }

  const server = app.listen(env.PORT, () => console.info(`API listening on http://localhost:${env.PORT}`));

  const shutdown = () => server.close(() => pool.end().then(() => process.exit(0)));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
