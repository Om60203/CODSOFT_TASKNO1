const { pool, ensureSchema } = require("../../../lib/db");

export default async function handler(req, res) {
  await ensureSchema();
  const id = Number(req.query.id);

  if (req.method === "PUT") {
    const { name, rollNo, className, section, email, phone, guardian } = req.body;
    const { rows } = await pool.query(
      `UPDATE students SET name=$1, "rollNo"=$2, "className"=$3, section=$4, email=$5, phone=$6, guardian=$7 WHERE id=$8 RETURNING *`,
      [name, rollNo, className, section, email || "", phone || "", guardian || "", id]
    );
    return res.status(200).json(rows[0]);
  }

  if (req.method === "DELETE") {
    await pool.query("DELETE FROM students WHERE id = $1", [id]);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end();
}