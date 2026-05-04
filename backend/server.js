// server.js - TechCore IT Ticketing System backend
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const initDb = require('./init-db');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 8080;

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'techcore-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
          secure: false,
          maxAge: 1000 * 60 * 60 * 2
    }
}));

// Serve static frontend files (./frontend relative to backend __dirname)
                             app.use(express.static(path.join(__dirname, 'frontend')));
// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

// ---- Catch-all: serve frontend for any non-API route ----
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/login.html'));});

// ---- Start server (after DB bootstrap) ----
initDb()
  .then(() => {
        app.listen(PORT, () => {
                console.log(`TechCore IT Ticketing System running at http://localhost:${PORT}`);
                console.log('Press Ctrl+C to stop.');
        });
  })
  .catch((err) => {
        console.error('Database init failed:', err.message);
        process.exit(1);
  });
