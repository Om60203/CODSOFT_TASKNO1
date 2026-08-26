const { pool, ensureSchema } = require("../../../lib/db");

export default async function handler(req, res) {
  await ensureSchema();

  if (req.method === "GET") {
    const { rows } = await pool.query("SELECT * FROM teachers ORDER BY id DESC");
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { name, subject, email, phone, className } = req.body;
    if (!name || !subject || !className) {
      return res.status(400).json({ error: "name, subject, and className are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO teachers (name, subject, email, phone, "className") VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, subject, email || "", phone || "", className]
    );
    return res.status(201).json(rows[0]);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}