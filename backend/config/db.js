// config/db.js - MySQL connection
// ES: credentials pulled from .env so nobody hardcodes their password in the repo
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'techcore_ticketing',
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
          console.error('MySQL connection error:', err.message);
          process.exit(1);
    }
    console.log('Connected to MySQL database.');
});

module.exports = db;
