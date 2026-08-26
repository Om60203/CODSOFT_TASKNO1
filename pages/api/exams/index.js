const { pool, ensureSchema } = require("../../../lib/db");

export default async function handler(req, res) {
  await ensureSchema();

  if (req.method === "GET") {
    const { studentId } = req.query;
    const query = studentId
      ? { text: `SELECT e.*, s.name as "studentName" FROM exam_results e JOIN students s ON s.id = e."studentId" WHERE e."studentId" = $1 ORDER BY e.id DESC`, values: [Number(studentId)] }
      : { text: `SELECT e.*, s.name as "studentName" FROM exam_results e JOIN students s ON s.id = e."studentId" ORDER BY e.id DESC`, values: [] };
    const { rows } = await pool.query(query);
    const shaped = rows.map((r) => ({
      id: r.id, studentId: r.studentId, examName: r.examName, subject: r.subject, marks: r.marks, maxMarks: r.maxMarks,
      student: { name: r.studentName },
    }));
    return res.status(200).json(shaped);
  }

  if (req.method === "POST") {
    const { studentId, examName, subject, marks, maxMarks } = req.body;
    if (!studentId || !examName || !subject || marks === undefined || !maxMarks) {
      return res.status(400).json({ error: "studentId, examName, subject, marks, and maxMarks are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO exam_results ("studentId", "examName", subject, marks, "maxMarks") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [Number(studentId), examName, subject, Number(marks), Number(maxMarks)]
    );
    return res.status(201).json({ id: rows[0].id });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}