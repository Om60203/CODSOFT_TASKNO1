const db = require("../../../lib/db");
const { verifyPassword, createSession, setSessionCookie } = require("../../../lib/auth");

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and role are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ? AND role = ?").get(email.toLowerCase().trim(), role);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { token } = createSession(user.id);
  setSessionCookie(res, token);

  delete user.passwordHash;
  return res.status(200).json({ user });
}
