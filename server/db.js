/* ================================
   AL-WAHA — MySQL Connection Pool
   Set AIVEN=true env + MYSQL* vars for cloud MySQL
   ================================ */
const mysql = require('mysql2/promise');

const useAiven = process.env.AIVEN === 'true';
const missing = useAiven && !process.env.MYSQLPASSWORD;

const pool = mysql.createPool(
  useAiven ? {
    host: process.env.MYSQLHOST || 'mysql-3577acf-al-hawa.h.aivencloud.com',
    port: parseInt(process.env.MYSQLPORT) || 19170,
    user: process.env.MYSQLUSER || 'avnadmin',
    password: process.env.MYSQLPASSWORD || (missing ? '' : ''),
    database: process.env.MYSQLDATABASE || 'defaultdb',
    ssl: { rejectUnauthorized: false }
  } : {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'alwaha123',
    database: 'alwaha'
  }
);

if (missing) console.error('ERROR: AIVEN=true but MYSQLPASSWORD not set!');

pool.config = { ...pool.config,
  waitForConnections: true,
  connectionLimit: useAiven ? 5 : 10,
  charset: 'utf8mb4'
};

module.exports = pool;
