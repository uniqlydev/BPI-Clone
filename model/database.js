"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pool = require('pg').Pool;
// Load .env
require('dotenv').config();
const pool = new Pool({
    host: "localhost",
    user: "app_user",
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT,
});
exports.default = pool;
