const { pool, ensureSchema } = require("../../../lib/db");
const { verifyPassword, createSession, setSessionCookie } = require("../../../lib/auth");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }
  await ensureSchema();

  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and role are required" });
  }

  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1 AND role = $2`, [email.toLowerCase().trim(), role]);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { token } = await createSession(user.id);
  setSessionCookie(res, token);

  delete user.passwordHash;
  return res.status(200).json({ user });
}