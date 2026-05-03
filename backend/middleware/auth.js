// middleware/auth.js
// RR: checks login + role on every request, not just at login
// WM: verified this covers the security requirements from section 3.1.4 of report

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not logged in. Please log in first.' });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Not logged in.' });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do that.' });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };
