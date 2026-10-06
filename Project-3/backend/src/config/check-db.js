const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config(); // loads .env from parent if present

async function main() {
    // Try to read settings from env
    console.log("Env vars in JS:", {
        PG_USER: process.env.PG_USER,
        PG_HOST: process.env.PG_HOST,
        PG_NAME: process.env.PG_NAME,
        PG_PASSWORD: process.env.PG_PASSWORD,
        PG_PORT: process.env.PG_PORT,
    });

    const pool = new Pool({
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || 'localhost',
        database: process.env.PG_NAME || 'postgres',
        password: process.env.PG_PASSWORD || 'hello',
        port: parseInt(process.env.PG_PORT || '5432'),
    });

    try {
        const client = await pool.connect();
        console.log("Connected successfully to PostgreSQL!");
        const dbRes = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
        console.log("Databases:", dbRes.rows.map(r => r.datname));
        
        // Let's see if the database process.env.PG_NAME or 'Test' or 'rental_marketplace' exists
        const currentDb = process.env.PG_NAME || 'Test';
        console.log(`Checking if database ${currentDb} has properties table...`);
        client.release();
        await pool.end();

        // Connect specifically to that database
        const pool2 = new Pool({
            user: process.env.PG_USER || 'postgres',
            host: process.env.PG_HOST || 'localhost',
            database: currentDb,
            password: process.env.PG_PASSWORD || 'hello',
            port: parseInt(process.env.PG_PORT || '5432'),
        });
        
        const client2 = await pool2.connect();
        const tablesRes = await client2.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log("Tables in database:", tablesRes.rows.map(r => r.table_name));

        // If properties table exists, describe its columns
        if (tablesRes.rows.some(r => r.table_name === 'properties')) {
            const colsRes = await client2.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'properties';
            `);
            console.log("Properties columns:", colsRes.rows.map(r => `${r.column_name} (${r.data_type})`));
        }

        client2.release();
        await pool2.end();
    } catch (err) {
        console.error("Database check failed:", err.message);
    }
}

main();
