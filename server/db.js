/* ================================
   AL-WAHA — MySQL Connection Pool
   Config via env vars (DB_*), same pattern as gobulkvape project:
   - Local dev: .env file in project root (git-ignored)
   - Production (Render): set DB_* env vars in Render dashboard
   ================================ */
const mysql = require('mysql2/promise');
const path = require('path');

// Load local .env from project root if present (silently skip when absent, e.g. on Render)
try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch {}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'alwaha123',
  database: process.env.DB_NAME || 'alwaha',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL) || 10,
  charset: 'utf8mb4'
});

module.exports = pool;
