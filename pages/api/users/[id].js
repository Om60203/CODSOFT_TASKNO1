const db = require("../../../lib/db");
const { getUserFromReq } = require("../../../lib/auth");

export default function handler(req, res) {
  const currentUser = getUserFromReq(req);
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const id = Number(req.query.id);

  if (req.method === "DELETE") {
    if (id === currentUser.id) {
      return res.status(400).json({ error: "You can't delete your own account while logged in" });
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end();
}
