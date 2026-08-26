const { pool, ensureSchema } = require("../../../lib/db");

export default async function handler(req, res) {
  await ensureSchema();

  if (req.method === "GET") {
    const { studentId } = req.query;
    const query = studentId
      ? { text: `SELECT a.*, s.name as "studentName", s."rollNo" as "studentRollNo" FROM attendance a JOIN students s ON s.id = a."studentId" WHERE a."studentId" = $1 ORDER BY a.id DESC`, values: [Number(studentId)] }
      : { text: `SELECT a.*, s.name as "studentName", s."rollNo" as "studentRollNo" FROM attendance a JOIN students s ON s.id = a."studentId" ORDER BY a.id DESC`, values: [] };
    const { rows } = await pool.query(query);
    const shaped = rows.map((r) => ({
      id: r.id, studentId: r.studentId, date: r.date, status: r.status,
      student: { name: r.studentName, rollNo: r.studentRollNo },
    }));
    return res.status(200).json(shaped);
  }

  if (req.method === "POST") {
    const { studentId, date, status } = req.body;
    if (!studentId || !date || !status) {
      return res.status(400).json({ error: "studentId, date, and status are required" });
    }
    const existing = await pool.query(`SELECT id FROM attendance WHERE "studentId" = $1 AND date = $2`, [Number(studentId), date]);
    if (existing.rows[0]) {
      await pool.query(`UPDATE attendance SET status = $1 WHERE id = $2`, [status, existing.rows[0].id]);
    } else {
      await pool.query(`INSERT INTO attendance ("studentId", date, status) VALUES ($1,$2,$3)`, [Number(studentId), date, status]);
    }
    return res.status(201).json({ ok: true });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}