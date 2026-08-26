const { pool, ensureSchema } = require("../../../lib/db");
const { getUserFromReq } = require("../../../lib/auth");

export default async function handler(req, res) {
  await ensureSchema();
  const currentUser = await getUserFromReq(req);
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const id = Number(req.query.id);

  if (req.method === "DELETE") {
    if (id === currentUser.id) {
      return res.status(400).json({ error: "You can't delete your own account while logged in" });
    }
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end();
}