const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_NAME,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
});
pool.connect((err, client, release) => {
    if (err) {
        console.log("Error connecting to database:", err);
        return;
    }

    console.log("Successfully Connected to the Database");
    release();
});
module.exports = {
    client: () => pool.connect(),
    query: (text, params) => pool.query(text, params),
};