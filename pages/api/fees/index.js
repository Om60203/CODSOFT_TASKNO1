const db = require("../../../lib/db");

export default function handler(req, res) {
  if (req.method === "GET") {
    const { studentId } = req.query;
    const rows = studentId
      ? db
          .prepare(
            `SELECT f.*, s.name as studentName FROM fees f JOIN students s ON s.id = f.studentId
             WHERE f.studentId = ? ORDER BY f.id DESC`
          )
          .all(Number(studentId))
      : db
          .prepare(
            `SELECT f.*, s.name as studentName FROM fees f JOIN students s ON s.id = f.studentId ORDER BY f.id DESC`
          )
          .all();
    const shaped = rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      amount: r.amount,
      term: r.term,
      status: r.status,
      dueDate: r.dueDate,
      student: { name: r.studentName },
    }));
    return res.status(200).json(shaped);
  }

  if (req.method === "POST") {
    const { studentId, amount, term, status, dueDate } = req.body;
    if (!studentId || !amount || !term || !dueDate) {
      return res.status(400).json({ error: "studentId, amount, term, and dueDate are required" });
    }
    const info = db
      .prepare(`INSERT INTO fees (studentId, amount, term, status, dueDate) VALUES (?, ?, ?, ?, ?)`)
      .run(Number(studentId), Number(amount), term, status || "Pending", dueDate);
    return res.status(201).json({ id: info.lastInsertRowid });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
