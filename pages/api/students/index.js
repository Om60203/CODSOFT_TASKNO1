const { pool, ensureSchema } = require("../../../lib/db");

export default async function handler(req, res) {
  await ensureSchema();

  if (req.method === "GET") {
    const { rows } = await pool.query("SELECT * FROM students ORDER BY id DESC");
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { name, rollNo, className, section, email, phone, guardian } = req.body;
    if (!name || !rollNo || !className || !section) {
      return res.status(400).json({ error: "name, rollNo, className, and section are required" });
    }
    try {
      const { rows } = await pool.query(
        `INSERT INTO students (name, "rollNo", "className", section, email, phone, guardian) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [name, rollNo, className, section, email || "", phone || "", guardian || ""]
      );
      return res.status(201).json(rows[0]);
    } catch (e) {
      return res.status(400).json({ error: "Roll number already exists" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}