// routes/auth.js - login, logout, register
// RR: bcrypt handles password hashing, never store plain text
const express = require('express');
const bcrypt  = require('bcrypt');
const db      = require('../config/db');
const router  = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const sql = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // RR: only store what the frontend needs, password hash stays out of session
    req.session.user = {
      user_id:   user.user_id,
      username:  user.username,
      full_name: user.full_name,
      role:      user.role
    };

    res.json({
      message:  'Login successful.',
      user: req.session.user
    });
  });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, full_name, email, password } = req.body;

  if (!username || !full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  // RR: basic email check, not perfect but good enough for our scope
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [username.trim(), hash, full_name.trim(), email.trim().toLowerCase(), 'user'], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Username already taken. Please choose another.' });
        }
        return res.status(500).json({ error: 'Database error.' });
      }
      res.status(201).json({ message: 'Account created successfully. You can now log in.' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
});

// GET /api/auth/me - check who is currently logged in
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in.' });
  }
  res.json({ user: req.session.user });
});

module.exports = router;
