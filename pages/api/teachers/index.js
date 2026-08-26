const db = require("../../../lib/db");

export default function handler(req, res) {
  if (req.method === "GET") {
    const teachers = db.prepare("SELECT * FROM teachers ORDER BY id DESC").all();
    return res.status(200).json(teachers);
  }

  if (req.method === "POST") {
    const { name, subject, email, phone, className } = req.body;
    if (!name || !subject || !className) {
      return res.status(400).json({ error: "name, subject, and className are required" });
    }
    const info = db
      .prepare(`INSERT INTO teachers (name, subject, email, phone, className) VALUES (?, ?, ?, ?, ?)`)
      .run(name, subject, email || "", phone || "", className);
    const teacher = db.prepare("SELECT * FROM teachers WHERE id = ?").get(info.lastInsertRowid);
    return res.status(201).json(teacher);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
