const db = require("../../../lib/db");

export default function handler(req, res) {
  if (req.method === "GET") {
    const { studentId } = req.query;
    const rows = studentId
      ? db
          .prepare(
            `SELECT a.*, s.name as studentName, s.rollNo as studentRollNo
             FROM attendance a JOIN students s ON s.id = a.studentId
             WHERE a.studentId = ? ORDER BY a.id DESC`
          )
          .all(Number(studentId))
      : db
          .prepare(
            `SELECT a.*, s.name as studentName, s.rollNo as studentRollNo
             FROM attendance a JOIN students s ON s.id = a.studentId
             ORDER BY a.id DESC`
          )
          .all();
    const shaped = rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      date: r.date,
      status: r.status,
      student: { name: r.studentName, rollNo: r.studentRollNo },
    }));
    return res.status(200).json(shaped);
  }

  if (req.method === "POST") {
    const { studentId, date, status } = req.body;
    if (!studentId || !date || !status) {
      return res.status(400).json({ error: "studentId, date, and status are required" });
    }
    const existing = db
      .prepare("SELECT id FROM attendance WHERE studentId = ? AND date = ?")
      .get(Number(studentId), date);
    if (existing) {
      db.prepare("UPDATE attendance SET status = ? WHERE id = ?").run(status, existing.id);
    } else {
      db.prepare("INSERT INTO attendance (studentId, date, status) VALUES (?, ?, ?)").run(
        Number(studentId),
        date,
        status
      );
    }
    return res.status(201).json({ ok: true });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
