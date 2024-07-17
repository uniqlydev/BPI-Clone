const Pool = require('pg').Pool


// Load .env
require('dotenv').config();
const pool = new Pool({
    host: "localhost",
    user: "app_user",
    database: "bpi",
    password: "password",
    port: "5432"
});

export default pool;

