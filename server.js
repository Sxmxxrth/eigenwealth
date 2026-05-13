require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { addSignup, getCount, getAllSignups, closeDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ───────────────────────────────── */
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Static Files ────────────────────────────── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── Rate Limiting ───────────────────────────── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── API Routes ──────────────────────────────── */

// POST /api/waitlist — Add new signup
app.post('/api/waitlist', apiLimiter, (req, res) => {
  const { first_name, last_name, email, whatsapp, portfolio_size, source } = req.body;

  // Validation
  if (!first_name || !first_name.trim()) {
    return res.status(400).json({ success: false, error: 'First name is required' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  const result = addSignup({
    first_name: first_name.trim(),
    last_name: (last_name || '').trim(),
    email: email.trim().toLowerCase(),
    whatsapp: (whatsapp || '').trim(),
    portfolio_size: (portfolio_size || '').trim(),
    source: source || 'hero',
    ip_address: typeof ip === 'string' ? ip.split(',')[0].trim() : '',
  });

  if (result.success) {
    const count = getCount();
    return res.status(201).json({ success: true, message: "You're on the list!", count });
  } else {
    return res.status(409).json(result);
  }
});

// GET /api/waitlist/count — Public counter
app.get('/api/waitlist/count', (req, res) => {
  const count = getCount();
  // Add a base offset (for the 300+ existing waitlist from before the backend)
  res.json({ count: count + 300 });
});

/* ── Admin Routes (Basic Auth) ───────────────── */
function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Authentication required' });
  }
  const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [user, pass] = decoded.split(':');
  if (user === (process.env.ADMIN_USER || 'admin') && pass === (process.env.ADMIN_PASS || 'eigenwealth2025')) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}

// GET /api/admin/waitlist — View all signups
app.get('/api/admin/waitlist', adminAuth, (req, res) => {
  const signups = getAllSignups();
  res.json({ total: signups.length, signups });
});

// GET /api/admin/export — CSV export
app.get('/api/admin/export', adminAuth, (req, res) => {
  const signups = getAllSignups();
  const header = 'ID,First Name,Last Name,Email,WhatsApp,Portfolio Size,Source,IP,Signed Up\n';
  const rows = signups.map(s =>
    `${s.id},"${s.first_name}","${s.last_name}","${s.email}","${s.whatsapp}","${s.portfolio_size}","${s.source}","${s.ip_address}","${s.created_at}"`
  ).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=eigenwealth_waitlist.csv');
  res.send(header + rows);
});

/* ── Fallback ────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Start ───────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  ⚡ Eigenwealth server running`);
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log(`  📊 Admin: http://localhost:${PORT}/api/admin/waitlist`);
  console.log(`  📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => { closeDb(); process.exit(0); });
process.on('SIGTERM', () => { closeDb(); process.exit(0); });
