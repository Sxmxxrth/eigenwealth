const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'eigenwealth.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT DEFAULT '',
      email TEXT NOT NULL UNIQUE,
      whatsapp TEXT DEFAULT '',
      portfolio_size TEXT DEFAULT '',
      source TEXT DEFAULT 'hero',
      ip_address TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
    CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at);
  `);
}

/* ── Prepared Statements ─────────────────────── */

function addSignup({ first_name, last_name, email, whatsapp, portfolio_size, source, ip_address }) {
  const d = getDb();
  const stmt = d.prepare(`
    INSERT INTO waitlist (first_name, last_name, email, whatsapp, portfolio_size, source, ip_address)
    VALUES (@first_name, @last_name, @email, @whatsapp, @portfolio_size, @source, @ip_address)
  `);
  try {
    const info = stmt.run({ first_name, last_name: last_name || '', email, whatsapp: whatsapp || '', portfolio_size: portfolio_size || '', source: source || 'hero', ip_address: ip_address || '' });
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Email already registered' };
    }
    throw err;
  }
}

function getCount() {
  const d = getDb();
  const row = d.prepare('SELECT COUNT(*) as count FROM waitlist').get();
  return row.count;
}

function getAllSignups() {
  const d = getDb();
  return d.prepare('SELECT * FROM waitlist ORDER BY created_at DESC').all();
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { addSignup, getCount, getAllSignups, closeDb };
