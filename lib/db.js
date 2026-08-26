const { Pool } = require("pg");

const pool = global._eduPool || new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});
if (process.env.NODE_ENV !== "production") global._eduPool = pool;

let initialized = global._eduDbInit || false;

async function ensureSchema() {
  if (initialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      "rollNo" TEXT NOT NULL UNIQUE,
      "className" TEXT NOT NULL,
      section TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      guardian TEXT DEFAULT '',
      "createdAt" TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS teachers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      "className" TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      "studentId" INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS fees (
      id SERIAL PRIMARY KEY,
      "studentId" INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      term TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      "dueDate" TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS exam_results (
      id SERIAL PRIMARY KEY,
      "studentId" INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      "examName" TEXT NOT NULL,
      subject TEXT NOT NULL,
      marks REAL NOT NULL,
      "maxMarks" REAL NOT NULL,
      "createdAt" TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
      name TEXT NOT NULL,
      "studentId" INTEGER REFERENCES students(id) ON DELETE SET NULL,
      "teacherId" INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
      "createdAt" TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT now()
    );
  `);
  initialized = true;
  global._eduDbInit = true;
}

module.exports = { pool, ensureSchema };