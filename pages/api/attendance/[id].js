const { pool, ensureSchema } = require("../../../lib/db");

export default async function handler(req, res) {
  await ensureSchema();
  const id = Number(req.query.id);

  if (req.method === "DELETE") {
    await pool.query("DELETE FROM attendance WHERE id = $1", [id]);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end();
}