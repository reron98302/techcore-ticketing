// routes/admin.js - admin-only user management
// RR: all routes here require admin role, checked by requireRole middleware
const express                 = require('express');
const db                      = require('../config/db');
const { requireRole }         = require('../middleware/auth');
const router                  = express.Router();

// GET /api/admin/users - list all users
router.get('/users', requireRole('admin'), (req, res) => {
  const sql = `SELECT user_id, username, full_name, email, role, is_active, created_at
               FROM users ORDER BY role, full_name`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ users: results });
  });
});

// PATCH /api/admin/users/:id/role - change a user's role
router.patch('/users/:id/role', requireRole('admin'), (req, res) => {
  const { role } = req.body;
  const userId   = req.params.id;
  const validRoles = ['user', 'it_staff', 'admin'];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  // RR: prevent admin from changing their own role so they can't lock themselves out
  if (parseInt(userId) === req.session.user.user_id) {
    return res.status(400).json({ error: 'You cannot change your own role.' });
  }

  db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, userId], (err) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ message: 'Role updated.' });
  });
});

// PATCH /api/admin/users/:id/status - activate or deactivate an account
router.patch('/users/:id/status', requireRole('admin'), (req, res) => {
  const { is_active } = req.body;
  const userId        = req.params.id;

  if (is_active === undefined) {
    return res.status(400).json({ error: 'is_active is required.' });
  }

  if (parseInt(userId) === req.session.user.user_id) {
    return res.status(400).json({ error: 'You cannot deactivate your own account.' });
  }

  db.query('UPDATE users SET is_active = ? WHERE user_id = ?', [is_active ? 1 : 0, userId], (err) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ message: is_active ? 'Account activated.' : 'Account deactivated.' });
  });
});

module.exports = router;
