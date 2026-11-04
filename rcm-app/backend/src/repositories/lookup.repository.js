const { query } = require('../config/db');

const all = async () => {
  const [payers, actionCodes, statusCodes] = await Promise.all([
    query('SELECT id, name FROM payers ORDER BY name'),
    query('SELECT code, label FROM action_codes ORDER BY label'),
    query('SELECT code, description FROM status_codes ORDER BY code'),
  ]);
  return { payers: payers.rows, actionCodes: actionCodes.rows, statusCodes: statusCodes.rows };
};

module.exports = { all };
