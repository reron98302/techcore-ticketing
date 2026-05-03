// config/db.js - MySQL connection
// ES: credentials pulled from .env so nobody hardcodes their password in the repo
const mysql = require('mysql2');

const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'techcore_ticketing'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
});

module.exports = db;
