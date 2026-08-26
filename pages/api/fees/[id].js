const { pool, ensureSchema } = require("../../../lib/db");

export default async function handler(req, res) {
  await ensureSchema();
  const id = Number(req.query.id);

  if (req.method === "PUT") {
    const { status } = req.body;
    const { rows } = await pool.query(`UPDATE fees SET status = $1 WHERE id = $2 RETURNING *`, [status, id]);
    return res.status(200).json(rows[0]);
  }

  if (req.method === "DELETE") {
    await pool.query("DELETE FROM fees WHERE id = $1", [id]);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end();
}