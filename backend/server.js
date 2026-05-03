// server.js - TechCore IT Ticketing System backend
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path    = require('path');

const authRoutes   = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const adminRoutes  = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'techcore-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,       // set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 2  // 2 hour session timeout
  }
}));

// Serve frontend files from the public folder (copied during build)
app.use(express.static(path.join(__dirname, '../frontend')));
// ---- API Routes ----
app.use('/api/auth',    authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin',   adminRoutes);

// ---- Catch-all: serve frontend for any non-API route ----
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`TechCore IT Ticketing System running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop.');
});
