const db = require("../../../lib/db");
const { getUserFromReq, hashPassword } = require("../../../lib/auth");

export default function handler(req, res) {
  const currentUser = getUserFromReq(req);
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  if (req.method === "GET") {
    const users = db
      .prepare(
        `SELECT u.id, u.email, u.role, u.name, u.studentId, u.teacherId, u.createdAt,
                s.rollNo as studentRollNo, t.subject as teacherSubject
         FROM users u
         LEFT JOIN students s ON s.id = u.studentId
         LEFT JOIN teachers t ON t.id = u.teacherId
         ORDER BY u.id DESC`
      )
      .all();
    return res.status(200).json(users);
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
      const info = db
        .prepare(
          `INSERT INTO users (email, passwordHash, role, name, studentId, teacherId) VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(
          email.toLowerCase().trim(),
          hashPassword(password),
          role,
          name,
          studentId ? Number(studentId) : null,
          teacherId ? Number(teacherId) : null
        );
      return res.status(201).json({ id: info.lastInsertRowid });
    } catch (e) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
