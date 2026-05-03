// routes/tickets.js - ticket CRUD
// RR: all queries use parameterized inputs, no raw string concat (SQL injection protection)
const express                    = require('express');
const db                         = require('../config/db');
const { requireLogin, requireRole } = require('../middleware/auth');
const router                     = express.Router();

// GET /api/tickets - get all tickets
// Users see only their own. IT staff and admins see all.
router.get('/', requireLogin, (req, res) => {
  const user = req.session.user;
  let sql, params;

  // RR: regular users only see their own tickets per section 3.2.2 workflow
  if (user.role === 'user') {
    sql = `
      SELECT t.*, s.status_name,
             u1.full_name AS submitted_by_name,
             u2.full_name AS assigned_to_name
      FROM tickets t
      JOIN status s ON t.status_id = s.status_id
      JOIN users u1 ON t.submitted_by = u1.user_id
      LEFT JOIN users u2 ON t.assigned_to = u2.user_id
      WHERE t.submitted_by = ?
      ORDER BY t.created_at DESC`;
    params = [user.user_id];
  } else {
    sql = `
      SELECT t.*, s.status_name,
             u1.full_name AS submitted_by_name,
             u2.full_name AS assigned_to_name
      FROM tickets t
      JOIN status s ON t.status_id = s.status_id
      JOIN users u1 ON t.submitted_by = u1.user_id
      LEFT JOIN users u2 ON t.assigned_to = u2.user_id
      ORDER BY t.created_at DESC`;
    params = [];
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ tickets: results });
  });
});

// GET /api/tickets/:id - get single ticket with logs
router.get('/:id', requireLogin, (req, res) => {
  const ticketId = req.params.id;
  const user     = req.session.user;

  const sql = `
    SELECT t.*, s.status_name,
           u1.full_name AS submitted_by_name,
           u2.full_name AS assigned_to_name
    FROM tickets t
    JOIN status s ON t.status_id = s.status_id
    JOIN users u1 ON t.submitted_by = u1.user_id
    LEFT JOIN users u2 ON t.assigned_to = u2.user_id
    WHERE t.ticket_id = ?`;

  db.query(sql, [ticketId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (results.length === 0) return res.status(404).json({ error: 'Ticket not found.' });

    const ticket = results[0];

    // Users can only see their own tickets
    if (user.role === 'user' && ticket.submitted_by !== user.user_id) {
      return res.status(403).json({ error: 'You do not have permission to view this ticket.' });
    }

    // Get logs for this ticket
    const logSql = `
      SELECT l.*, u.full_name
      FROM logs l
      JOIN users u ON l.user_id = u.user_id
      WHERE l.ticket_id = ?
      ORDER BY l.logged_at ASC`;

    db.query(logSql, [ticketId], (err2, logs) => {
      if (err2) return res.status(500).json({ error: 'Database error.' });
      res.json({ ticket, logs });
    });
  });
});

// POST /api/tickets - submit a new ticket
router.post('/', requireLogin, (req, res) => {
  const { title, description, category, priority } = req.body;
  const user = req.session.user;

  if (!title || !description || !category || !priority) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const validCategories = ['Hardware', 'Software', 'Network', 'Account', 'Other'];
  const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
  if (!validCategories.includes(category)) return res.status(400).json({ error: 'Invalid category.' });
  if (!validPriorities.includes(priority))  return res.status(400).json({ error: 'Invalid priority.' });

  const sql = 'INSERT INTO tickets (title, description, category, priority, status_id, submitted_by) VALUES (?, ?, ?, ?, 1, ?)';
  db.query(sql, [title, description, category, priority, user.user_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error.' });

    const ticketId = result.insertId;
    // ES: every action gets logged so we have a full history per section 3.2.3
    db.query('INSERT INTO logs (ticket_id, user_id, action) VALUES (?, ?, ?)',
      [ticketId, user.user_id, 'Ticket submitted']);

    res.status(201).json({ message: 'Ticket submitted.', ticket_id: ticketId });
  });
});

// PATCH /api/tickets/:id/status - update ticket status (IT staff and admin only)
router.patch('/:id/status', requireRole('it_staff', 'admin'), (req, res) => {
  const { status_id } = req.body;
  const ticketId = req.params.id;
  const user     = req.session.user;

  if (!status_id) return res.status(400).json({ error: 'status_id is required.' });

  // Get status name for the log
  db.query('SELECT status_name FROM status WHERE status_id = ?', [status_id], (err, statusResult) => {
    if (err || statusResult.length === 0) return res.status(400).json({ error: 'Invalid status.' });

    const statusName = statusResult[0].status_name;
    db.query('UPDATE tickets SET status_id = ? WHERE ticket_id = ?', [status_id, ticketId], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error.' });

      db.query('INSERT INTO logs (ticket_id, user_id, action) VALUES (?, ?, ?)',
        [ticketId, user.user_id, `Status changed to ${statusName}`]);

      res.json({ message: `Ticket status updated to ${statusName}.` });
    });
  });
});

// PATCH /api/tickets/:id/assign - assign ticket to IT staff (admin only)
router.patch('/:id/assign', requireRole('it_staff', 'admin'), (req, res) => {
  const { assigned_to } = req.body;
  const ticketId = req.params.id;
  const user     = req.session.user;

  if (!assigned_to) return res.status(400).json({ error: 'assigned_to user_id is required.' });

  db.query('SELECT full_name FROM users WHERE user_id = ? AND role IN (?, ?)',
    [assigned_to, 'it_staff', 'admin'], (err, results) => {
      if (err || results.length === 0) return res.status(400).json({ error: 'Invalid user to assign to.' });

      const assignedName = results[0].full_name;
      db.query('UPDATE tickets SET assigned_to = ? WHERE ticket_id = ?', [assigned_to, ticketId], (err2) => {
        if (err2) return res.status(500).json({ error: 'Database error.' });

        db.query('INSERT INTO logs (ticket_id, user_id, action) VALUES (?, ?, ?)',
          [ticketId, user.user_id, `Ticket assigned to ${assignedName}`]);

        res.json({ message: `Ticket assigned to ${assignedName}.` });
      });
    });
});

// POST /api/tickets/:id/note - add a note to a ticket
// RR: submitter can add notes to their own ticket, staff/admin can add to any
router.post('/:id/note', requireLogin, (req, res) => {
  const { note } = req.body;
  const ticketId  = req.params.id;
  const user      = req.session.user;

  if (!note || !note.trim()) {
    return res.status(400).json({ error: 'Note cannot be empty.' });
  }

  const sql = `
    SELECT t.submitted_by FROM tickets t WHERE t.ticket_id = ?`;

  db.query(sql, [ticketId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Ticket not found.' });

    const ticket = results[0];
    const canNote = user.role === 'it_staff' || user.role === 'admin' || ticket.submitted_by === user.user_id;
    if (!canNote) return res.status(403).json({ error: 'You do not have permission to add notes to this ticket.' });

    db.query(
      'INSERT INTO logs (ticket_id, user_id, action, note) VALUES (?, ?, ?, ?)',
      [ticketId, user.user_id, 'Note added', note.trim()],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'Database error.' });
        res.json({ message: 'Note added.' });
      }
    );
  });
});

// GET /api/tickets/meta/staff - get IT staff list for assign dropdown (admin only)
router.get('/meta/staff', requireRole('it_staff', 'admin'), (req, res) => {
  db.query(
    "SELECT user_id, full_name FROM users WHERE role IN ('it_staff', 'admin') AND is_active = 1",
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json({ staff: results });
    }
  );
});

module.exports = router;
