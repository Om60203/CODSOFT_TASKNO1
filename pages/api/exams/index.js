const db = require("../../../lib/db");

export default function handler(req, res) {
  if (req.method === "GET") {
    const { studentId } = req.query;
    const rows = studentId
      ? db
          .prepare(
            `SELECT e.*, s.name as studentName FROM exam_results e JOIN students s ON s.id = e.studentId
             WHERE e.studentId = ? ORDER BY e.id DESC`
          )
          .all(Number(studentId))
      : db
          .prepare(
            `SELECT e.*, s.name as studentName FROM exam_results e JOIN students s ON s.id = e.studentId ORDER BY e.id DESC`
          )
          .all();
    const shaped = rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      examName: r.examName,
      subject: r.subject,
      marks: r.marks,
      maxMarks: r.maxMarks,
      student: { name: r.studentName },
    }));
    return res.status(200).json(shaped);
  }

  if (req.method === "POST") {
    const { studentId, examName, subject, marks, maxMarks } = req.body;
    if (!studentId || !examName || !subject || marks === undefined || !maxMarks) {
      return res.status(400).json({ error: "studentId, examName, subject, marks, and maxMarks are required" });
    }
    const info = db
      .prepare(
        `INSERT INTO exam_results (studentId, examName, subject, marks, maxMarks) VALUES (?, ?, ?, ?, ?)`
      )
      .run(Number(studentId), examName, subject, Number(marks), Number(maxMarks));
    return res.status(201).json({ id: info.lastInsertRowid });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
