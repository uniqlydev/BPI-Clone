const Pool = require("pg").Pool;

// Load .env
require("dotenv").config();

const createPool = (user: string) => {
  return new Pool({
    host: process.env.DB_HOST,
    user: user || process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
};

export default createPool;
