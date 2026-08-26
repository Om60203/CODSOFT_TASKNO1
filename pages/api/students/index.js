const db = require("../../../lib/db");

export default function handler(req, res) {
  if (req.method === "GET") {
    const students = db.prepare("SELECT * FROM students ORDER BY id DESC").all();
    return res.status(200).json(students);
  }

  if (req.method === "POST") {
    const { name, rollNo, className, section, email, phone, guardian } = req.body;
    if (!name || !rollNo || !className || !section) {
      return res.status(400).json({ error: "name, rollNo, className, and section are required" });
    }
    try {
      const info = db
        .prepare(
          `INSERT INTO students (name, rollNo, className, section, email, phone, guardian) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(name, rollNo, className, section, email || "", phone || "", guardian || "");
      const student = db.prepare("SELECT * FROM students WHERE id = ?").get(info.lastInsertRowid);
      return res.status(201).json(student);
    } catch (e) {
      return res.status(400).json({ error: "Roll number already exists" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
