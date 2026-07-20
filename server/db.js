/* ================================
   AL-WAHA — MySQL Connection Pool
   Supports local + Railway / cloud env
   ================================ */
const mysql = require('mysql2/promise');

// Railway provides: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'alwaha123',
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'alwaha',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

module.exports = pool;
