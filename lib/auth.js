const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const cookie = require("cookie");
const db = require("./db");

const COOKIE_NAME = "edumanage_session";
const SESSION_DAYS = 7;

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)").run(token, userId, expiresAt);
  return { token, expiresAt };
}

function destroySession(token) {
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

function getUserFromToken(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.*, s.expiresAt FROM sessions s JOIN users u ON u.id = s.userId WHERE s.token = ?`
    )
    .get(token);
  if (!row) return null;
  if (new Date(row.expiresAt) < new Date()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  delete row.passwordHash;
  return row;
}

function getUserFromReq(req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  return getUserFromToken(cookies[COOKIE_NAME]);
}

function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    })
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
  );
}

// For getServerSideProps (reads req.headers.cookie directly)
function requireUser(req, allowedRoles) {
  const user = getUserFromReq(req);
  if (!user) return { redirect: true, destination: "/login" };
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { redirect: true, destination: "/login" };
  }
  return { user };
}

module.exports = {
  COOKIE_NAME,
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getUserFromToken,
  getUserFromReq,
  setSessionCookie,
  clearSessionCookie,
  requireUser,
};
