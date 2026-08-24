const { Pool } = require('pg');

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.connect((err, client, release) => {
  if (err) return console.error(err);
  console.log("Successfully connected to Database");
  release();
});

module.exports = {
  client: () => pool.connect(),
  query: (text, params) => pool.query(text, params),
};