const { pool, ensureSchema } = require("../../../lib/db");

export default async function handler(req, res) {
  await ensureSchema();

  if (req.method === "GET") {
    const { studentId } = req.query;
    const query = studentId
      ? { text: `SELECT f.*, s.name as "studentName" FROM fees f JOIN students s ON s.id = f."studentId" WHERE f."studentId" = $1 ORDER BY f.id DESC`, values: [Number(studentId)] }
      : { text: `SELECT f.*, s.name as "studentName" FROM fees f JOIN students s ON s.id = f."studentId" ORDER BY f.id DESC`, values: [] };
    const { rows } = await pool.query(query);
    const shaped = rows.map((r) => ({
      id: r.id, studentId: r.studentId, amount: r.amount, term: r.term, status: r.status, dueDate: r.dueDate,
      student: { name: r.studentName },
    }));
    return res.status(200).json(shaped);
  }

  if (req.method === "POST") {
    const { studentId, amount, term, status, dueDate } = req.body;
    if (!studentId || !amount || !term || !dueDate) {
      return res.status(400).json({ error: "studentId, amount, term, and dueDate are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO fees ("studentId", amount, term, status, "dueDate") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [Number(studentId), Number(amount), term, status || "Pending", dueDate]
    );
    return res.status(201).json({ id: rows[0].id });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}