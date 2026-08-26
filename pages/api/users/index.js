const { pool, ensureSchema } = require("../../../lib/db");
const { getUserFromReq, hashPassword } = require("../../../lib/auth");

export default async function handler(req, res) {
  await ensureSchema();
  const currentUser = await getUserFromReq(req);
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  if (req.method === "GET") {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role, u.name, u."studentId", u."teacherId", u."createdAt",
              s."rollNo" as "studentRollNo", t.subject as "teacherSubject"
       FROM users u
       LEFT JOIN students s ON s.id = u."studentId"
       LEFT JOIN teachers t ON t.id = u."teacherId"
       ORDER BY u.id DESC`
    );
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { email, password, role, name, studentId, teacherId } = req.body;
    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: "email, password, role, and name are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (email, "passwordHash", role, name, "studentId", "teacherId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [email.toLowerCase().trim(), hashPassword(password), role, name, studentId ? Number(studentId) : null, teacherId ? Number(teacherId) : null]
      );
      return res.status(201).json({ id: rows[0].id });
    } catch (e) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}