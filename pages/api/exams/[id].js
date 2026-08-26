const db = require("../../../lib/db");

export default function handler(req, res) {
  const id = Number(req.query.id);

  if (req.method === "DELETE") {
    db.prepare("DELETE FROM exam_results WHERE id = ?").run(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end();
}
