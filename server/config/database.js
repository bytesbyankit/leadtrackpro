const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString && process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: DATABASE_URL or POSTGRES_URL is not defined in environment variables.');
}

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
