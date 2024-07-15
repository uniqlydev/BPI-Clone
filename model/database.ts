import { Pool } from 'pg';


require('dotenv').config();

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.DB_PORT || '0'),  // Ensure DB_PORT is set correctly in your .env file
});

export default pool;
