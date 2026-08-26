const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.cwd(), "data", "edumanage.db");
require("fs").mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rollNo TEXT NOT NULL UNIQUE,
  className TEXT NOT NULL,
  section TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  guardian TEXT DEFAULT '',
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  className TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  term TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  dueDate TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exam_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  examName TEXT NOT NULL,
  subject TEXT NOT NULL,
  marks REAL NOT NULL,
  maxMarks REAL NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
  name TEXT NOT NULL,
  studentId INTEGER REFERENCES students(id) ON DELETE SET NULL,
  teacherId INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expiresAt TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);
`);

module.exports = db;
